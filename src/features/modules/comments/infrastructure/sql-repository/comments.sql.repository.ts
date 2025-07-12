import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { LikeDto } from '../../dto/like.dto';
import { CommentDto } from '../../dto/comment.dto';
import { CommentsRepository } from '../comments.repository';
import { CommentViewModel } from '../../models/output/comment-view.model';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { LikesInfoViewModel } from '../../models/output/likes-info-view.model';
import { ILikeStatus } from '../../../../base/interfaces/like-status.interface';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';
import { LikeDetailsViewModel } from '../../../posts/models/output/like-details-view.model';

@Injectable()
export class CommentsSqlRepository extends CommentsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  private async findLikes(
    commentId: string,
    userId?: string,
  ): Promise<LikesInfoViewModel> {
    const result = await this.dataSource.query(
      `SELECT likes.user_id AS "userId", likes.added_at AS "addedAt", likes.status, users.login
       FROM public."Likes" likes
       LEFT OUTER JOIN public."Users" users 
       ON likes.user_id = users.id
       WHERE likes.comment_id = $1
       ORDER BY likes.added_at DESC`,
      [commentId],
    );

    const likes = result.filter(
      (like: LikeDetailsViewModel & { status: ILikeStatus }): boolean =>
        like.status === ILikeStatus.LIKE,
    );

    const dislikes = result.filter(
      (like: LikeDetailsViewModel & { status: ILikeStatus }): boolean =>
        like.status === ILikeStatus.DISLIKE,
    );

    const like = result.find(
      (like: LikeDetailsViewModel & { status: ILikeStatus }): boolean =>
        like.userId === userId,
    );

    return {
      likesCount: likes.length,
      dislikesCount: dislikes.length,
      myStatus: like?.status ?? ILikeStatus.NONE,
    };
  }

  async findComments(
    params: IPaginationParams,
    userId?: string,
  ): Promise<IPagination<CommentViewModel>> {
    const sort: string[] = [];
    const skip: string[] = [];
    const values: string[] = [];
    const filters: string[] = [];
    const offset = (params.pageNumber - 1) * params.pageSize;

    if (params.postId) {
      values.push(params.postId);
      filters.push(`post_id = $${values.length}`);
    }

    const where = !filters.length ? '' : `WHERE ${filters}`;
    const count = await this.dataSource.query(
      `SELECT COUNT(*) FROM public."Comments" ${where}`,
      values,
    );

    const totalCount = Number(count[0].count);
    const pagesCount = Math.ceil(totalCount / params.pageSize);

    sort.push(`"${params.sortBy}"`);
    sort.push(`${params.sortDirection}`);

    const orderBy = `ORDER BY ${sort.join(' ')}`;

    values.push(`${params.pageSize}`);
    skip.push(`LIMIT $${values.length}`);
    values.push(`${offset}`);
    skip.push(`OFFSET $${values.length}`);

    const limit = skip.join(' ');
    const result = await this.dataSource.query(
      `SELECT 
       comments.id,
       comments.content,
       comments.created_at AS "createdAt", 
       comments.user_id AS "userId", 
       users.login AS "userLogin"
       FROM public."Comments" comments
       LEFT OUTER JOIN public."Users" users 
       ON users.user_id = comments.id
       ${where}
       ${orderBy}
       ${limit}`,
      values,
    );

    const items = await Promise.all(
      result.map(
        async (
          comment: CommentViewModel & { userId: string; userLogin: string },
        ): Promise<CommentViewModel> => {
          const likesInfo = await this.findLikes(comment.id, userId);

          return {
            likesInfo,
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commentatorInfo: {
              userId: comment.userId,
              userLogin: comment.userLogin,
            },
          };
        },
      ),
    );

    return {
      items,
      totalCount,
      pagesCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
    };
  }

  async findComment(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    const result = await this.dataSource.query(
      `SELECT 
       comments.id,
       comments.content,
       comments.created_at AS "createdAt", 
       comments.user_id AS "userId", 
       users.login AS "userLogin"
       FROM public."Comments" comments
       LEFT OUTER JOIN public."Users" users 
       ON comments.user_id = users.id
       WHERE comments.id = $1`,
      [commentId],
    );

    if (!result[0]) {
      return null;
    }

    const likesInfo = await this.findLikes(commentId, userId);

    return {
      likesInfo,
      id: result[0].id,
      content: result[0].content,
      createdAt: result[0].createdAt,
      commentatorInfo: {
        userId: result[0].userId,
        userLogin: result[0].userLogin,
      },
    };
  }

  async createComment(
    dto: CommentDto,
    postId: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel> {
    const result = await this.dataSource.query(
      `INSERT INTO public."Comments"
       (post_id, content, user_id)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at AS "createdAt"`,
      [postId, dto.content, userId],
    );

    const likesInfo = await this.findLikes(result[0].id, userId);

    return {
      likesInfo,
      id: result[0].id,
      content: result[0].content,
      createdAt: result[0].createdAt,
      commentatorInfo: {
        userId,
        userLogin,
      },
    };
  }

  async updateComment(
    commentId: string,
    dto: CommentDto,
  ): Promise<CommentViewModel | null> {
    const result = await this.dataSource.query(
      `UPDATE public."Comments"
       SET content = $2
       WHERE id = $1
       RETURNING *`,
      [commentId, dto.content],
    );

    return result[0][0] ?? null;
  }

  async updateLike(
    commentId: string,
    dto: LikeDto,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel | null> {
    const result = await this.dataSource.query(
      `SELECT id, content, created_at AS "createdAt"
       FROM public."Comments"
       WHERE id = $1`,
      [commentId],
    );

    if (!result[0]) {
      return null;
    }

    await this.dataSource.query(
      `DELETE FROM public."Likes"
       WHERE comment_id = $1 AND user_id = $2`,
      [commentId, userId],
    );

    if (dto.likeStatus !== ILikeStatus.NONE) {
      await this.dataSource.query(
        `INSERT INTO public."Likes"
         (comment_id, user_id, added_at, status)
         VALUES ($1, $2, $3, $4)`,
        [commentId, userId, new Date().toISOString(), dto.likeStatus],
      );
    }

    const likesInfo = await this.findLikes(commentId, userId);

    return {
      likesInfo,
      id: result[0].id,
      content: result[0].content,
      createdAt: result[0].createdAt,
      commentatorInfo: {
        userId,
        userLogin,
      },
    };
  }

  async deleteComment(commentId: string): Promise<CommentViewModel | null> {
    const result = await this.dataSource.query(
      `DELETE FROM public."Comments"
       WHERE id = $1
       RETURNING *`,
      [commentId],
    );

    return result[0][0] ?? null;
  }

  async deleteAll(): Promise<void> {
    await this.dataSource.query('DELETE FROM public."Comments"');
  }
}
