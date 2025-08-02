import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { PostDto } from '../../dto/post.dto';
import { Post } from '../../entities/post.entity';
import { PostsRepository } from '../posts.repository';
import { PostsConfig } from '../../config/posts.config';
import { LikeDto } from '../../../comments/dto/like.dto';
import { Like } from '../../../comments/entities/like.entity';
import { PostViewModel } from '../../models/output/post-view.model';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { ILikeStatus } from '../../../../base/interfaces/like-status.interface';
import { LikeDetailsViewModel } from '../../models/output/like-details-view.model';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';

@Injectable()
export class PostsTypeormRepository extends PostsRepository {
  constructor(
    private readonly postsConfig: PostsConfig,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super();
  }

  async findPosts(
    params: IPaginationParams,
  ): Promise<IPagination<PostViewModel>> {
    const result = this.entityManager.createQueryBuilder(Post, 'post');

    if (params.blogId) {
      result.where({ blogId: params.blogId });
    }

    const [posts, totalCount] = await result
      .orderBy(
        `post.${params.sortBy}`,
        params.sortDirection?.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip((params.pageNumber - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount();

    return {
      totalCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      pagesCount: Math.ceil(totalCount / params.pageSize),
      items: posts.map((post: Post): PostViewModel => {
        return {
          id: post.id,
          title: post.title,
          blogId: post.blogId,
          content: post.content,
          blogName: post?.blog?.name || '',
          createdAt: post.createdAt,
          shortDescription: post.shortDescription,
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: ILikeStatus.NONE,
            newestLikes: [],
          },
        };
      }),
    };
  }

  async findPost(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    const post = await this.entityManager
      .createQueryBuilder(Post, 'post')
      .leftJoinAndSelect('post.blog', 'blog')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'user')
      .where('post.id = :postId', { postId })
      .getOne();

    if (!post) {
      return null;
    }

    const like = post.likes.find(
      (like: Like): boolean => like.userId === userId,
    );

    const likes = post.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.LIKE,
    );

    const dislikes = post.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.DISLIKE,
    );

    return {
      id: post.id,
      title: post.title,
      blogId: post.blogId,
      content: post.content,
      blogName: post.blog.name,
      createdAt: post.createdAt,
      shortDescription: post.shortDescription,
      extendedLikesInfo: {
        likesCount: likes.length,
        dislikesCount: dislikes.length,
        myStatus: like?.status ?? ILikeStatus.NONE,
        newestLikes: likes.slice(0, this.postsConfig.newestLikesLength).map(
          (like: Like): LikeDetailsViewModel => ({
            userId: like.userId,
            addedAt: like.addedAt,
            login: like.user.login,
          }),
        ),
      },
    };
  }

  async createPost(dto: PostDto, blogName: string): Promise<PostViewModel> {
    const post = new Post();

    post.title = dto.title;
    post.blogId = dto.blogId;
    post.content = dto.content;
    post.shortDescription = dto.shortDescription;

    await this.entityManager.save(Post, post);

    return {
      blogName,
      id: post.id,
      title: post.title,
      blogId: post.blogId,
      content: post.content,
      createdAt: post.createdAt,
      shortDescription: post.shortDescription,
      extendedLikesInfo: {
        likesCount: 0,
        newestLikes: [],
        dislikesCount: 0,
        myStatus: ILikeStatus.NONE,
      },
    };
  }

  async updatePost(
    postId: string,
    dto: PostDto,
    blogName: string,
  ): Promise<PostViewModel | null> {
    await this.entityManager.update(Post, postId, {
      title: dto.title,
      blogId: dto.blogId,
      content: dto.content,
      shortDescription: dto.shortDescription,
    });

    const post = await this.entityManager.findOne<Post>(Post, {
      where: { id: postId },
      relations: { likes: { user: true } },
    });

    if (!post) {
      return null;
    }

    const likes = post.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.LIKE,
    );

    const dislikes = post.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.DISLIKE,
    );

    return {
      blogName,
      id: post.id,
      title: post.title,
      blogId: post.blogId,
      content: post.content,
      createdAt: post.createdAt,
      shortDescription: post.shortDescription,
      extendedLikesInfo: {
        likesCount: likes.length,
        myStatus: ILikeStatus.NONE,
        dislikesCount: dislikes.length,
        newestLikes: likes.slice(0, this.postsConfig.newestLikesLength).map(
          (like: Like): LikeDetailsViewModel => ({
            userId: like.userId,
            addedAt: like.addedAt,
            login: like.user.login,
          }),
        ),
      },
    };
  }

  async updateLike(
    postId: string,
    updateLikeDto: LikeDto,
    userId: string,
  ): Promise<PostViewModel | null> {
    await this.entityManager.delete(Like, { postId, userId });

    if (updateLikeDto.likeStatus !== ILikeStatus.NONE) {
      const like = this.entityManager.create(Like, {
        userId,
        postId,
        status: updateLikeDto.likeStatus,
        addedAt: new Date().toISOString(),
      });

      await this.entityManager.save(Like, like);
    }

    const post = await this.entityManager.findOne<Post>(Post, {
      where: { id: postId },
      relations: { blog: true, likes: { user: true } },
    });

    if (!post) {
      return null;
    }

    const like = post.likes.find(
      (like: Like): boolean => like.userId === userId,
    );

    const likes = post.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.LIKE,
    );

    const dislikes = post.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.DISLIKE,
    );

    return {
      id: post.id,
      title: post.title,
      blogId: post.blogId,
      content: post.content,
      blogName: post.blog.name,
      createdAt: post.createdAt,
      shortDescription: post.shortDescription,
      extendedLikesInfo: {
        likesCount: likes.length,
        dislikesCount: dislikes.length,
        myStatus: like?.status ?? ILikeStatus.NONE,
        newestLikes: likes.slice(0, this.postsConfig.newestLikesLength).map(
          (like: Like): LikeDetailsViewModel => ({
            userId: like.userId,
            addedAt: like.addedAt,
            login: like.user.login,
          }),
        ),
      },
    };
  }

  async deletePost(postId: string): Promise<PostViewModel | null> {
    const post = await this.entityManager.findOne<Post>(Post, {
      where: { id: postId },
      relations: { blog: true, likes: { user: true } },
    });

    if (!post) {
      return null;
    }

    await this.entityManager.remove(post);

    const likes = post.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.LIKE,
    );

    const dislikes = post.likes.filter(
      (like: Like): boolean => like.status === ILikeStatus.DISLIKE,
    );

    return {
      id: post.id,
      title: post.title,
      blogId: post.blogId,
      content: post.content,
      blogName: post.blog.name,
      createdAt: post.createdAt,
      shortDescription: post.shortDescription,
      extendedLikesInfo: {
        likesCount: likes.length,
        myStatus: ILikeStatus.NONE,
        dislikesCount: dislikes.length,
        newestLikes: likes.slice(0, this.postsConfig.newestLikesLength).map(
          (like: Like): LikeDetailsViewModel => ({
            userId: like.userId,
            addedAt: like.addedAt,
            login: like.user.login,
          }),
        ),
      },
    };
  }

  async deleteAll(): Promise<void> {
    const posts = await this.entityManager.find(Post);

    await this.entityManager.remove(Post, posts);
  }
}
