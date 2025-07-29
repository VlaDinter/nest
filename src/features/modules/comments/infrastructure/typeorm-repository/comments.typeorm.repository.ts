import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { LikeDto } from '../../dto/like.dto';
import { Like } from '../../entities/like.entity';
import { CommentDto } from '../../dto/comment.dto';
import { Comment } from '../../entities/comment.entity';
import { CommentsRepository } from '../comments.repository';
import { CommentViewModel } from '../../models/output/comment-view.model';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { ILikeStatus } from '../../../../base/interfaces/like-status.interface';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';

@Injectable()
export class CommentsTypeormRepository extends CommentsRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super();
  }

  async findComments(
    params: IPaginationParams,
    userId?: string,
  ): Promise<IPagination<CommentViewModel>> {
    const result = this.entityManager
      .createQueryBuilder()
      .from(Comment, 'comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.likes', 'likes');

    if (params.postId) {
      result.where({ postId: params.postId });
    }

    const [comments, totalCount] = await result
      .orderBy(
        `comment.${params.sortBy}`,
        params.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip((params.pageNumber - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount();

    return {
      totalCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      pagesCount: Math.ceil(totalCount / params.pageSize),
      items: comments.map((comment: Comment): CommentViewModel => {
        const like = comment.likes.find(
          (like: Like): boolean => like.userId === userId,
        );

        const likes = comment.likes.filter(
          (like: Like): boolean => like.status === ILikeStatus.LIKE,
        );

        const dislikes = comment.likes.filter(
          (like: Like): boolean => like.status === ILikeStatus.DISLIKE,
        );

        return {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          commentatorInfo: {
            userId: comment.user.id,
            userLogin: comment.user.login,
          },
          likesInfo: {
            likesCount: likes.length,
            dislikesCount: dislikes.length,
            myStatus: like?.status ?? ILikeStatus.NONE,
          },
        };
      }),
    };
  }

  async findComment(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    const comment = await this.entityManager
      .createQueryBuilder(Comment, 'comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.likes', 'likes')
      .where('comment.id = :id', { id: commentId })
      .getOne();

    if (!comment) return null;

    const like = comment.likes.find(
      (like: Like): boolean => like.userId === userId,
    );

    const likes = comment.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.LIKE,
    );

    const dislikes = comment.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.DISLIKE,
    );

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.user.id,
        userLogin: comment.user.login,
      },
      likesInfo: {
        likesCount: likes.length,
        dislikesCount: dislikes.length,
        myStatus: like?.status ?? ILikeStatus.NONE,
      },
    };
  }

  async createComment(
    dto: CommentDto,
    postId: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel> {
    const comment = new Comment();

    comment.postId = postId;
    comment.userId = userId;
    comment.content = dto.content;

    await this.entityManager.save(comment);

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId,
        userLogin,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: ILikeStatus.NONE,
      },
    };
  }

  async updateComment(
    commentId: string,
    dto: CommentDto,
  ): Promise<CommentViewModel | null> {
    await this.entityManager.update(Comment, commentId, {
      content: dto.content,
    });

    const comment = await this.entityManager.findOne<Comment>(Comment, {
      where: { id: commentId },
      relations: ['user', 'likes'],
    });

    if (!comment) {
      return null;
    }

    const likes = comment.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.LIKE,
    );

    const dislikes = comment.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.DISLIKE,
    );

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.user.id,
        userLogin: comment.user.login,
      },
      likesInfo: {
        likesCount: likes.length,
        myStatus: ILikeStatus.NONE,
        dislikesCount: dislikes.length,
      },
    };
  }

  async updateLike(
    commentId: string,
    updateLikeDto: LikeDto,
    userId: string,
  ): Promise<CommentViewModel | null> {
    await this.entityManager.delete(Like, { commentId, userId });

    if (updateLikeDto.likeStatus !== ILikeStatus.NONE) {
      const like = this.entityManager.create(Like, {
        userId,
        commentId,
        status: updateLikeDto.likeStatus,
        addedAt: new Date().toISOString(),
      });

      await this.entityManager.save(Like, like);
    }

    const comment = await this.entityManager.findOne<Comment>(Comment, {
      where: { id: commentId },
      relations: ['user', 'likes'],
    });

    if (!comment) {
      return null;
    }

    const like = comment.likes.find(
      (like: Like): boolean => like.userId === userId,
    );

    const likes = comment.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.LIKE,
    );

    const dislikes = comment.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.DISLIKE,
    );

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.user.id,
        userLogin: comment.user.login,
      },
      likesInfo: {
        likesCount: likes.length,
        dislikesCount: dislikes.length,
        myStatus: like?.status ?? ILikeStatus.NONE,
      },
    };
  }

  async deleteComment(commentId: string): Promise<CommentViewModel | null> {
    const comment = await this.entityManager.findOne<Comment>(Comment, {
      where: { id: commentId },
      relations: ['user', 'likes'],
    });

    if (!comment) {
      return null;
    }

    await this.entityManager.remove(comment);

    const likes = comment.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.LIKE,
    );

    const dislikes = comment.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.DISLIKE,
    );

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.user.login,
      },
      likesInfo: {
        likesCount: likes.length,
        myStatus: ILikeStatus.NONE,
        dislikesCount: dislikes.length,
      },
    };
  }

  async deleteAll(): Promise<void> {
    const comments = await this.entityManager.find(Comment);

    await this.entityManager.remove(Comment, comments);
  }
}
