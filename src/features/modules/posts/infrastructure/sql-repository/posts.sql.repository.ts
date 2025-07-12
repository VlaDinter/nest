import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostDto } from '../../dto/post.dto';
import { PostsRepository } from '../posts.repository';
import { PostsConfig } from '../../config/posts.config';
import { LikeDto } from '../../../comments/dto/like.dto';
import { PostViewModel } from '../../models/output/post-view.model';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { ILikeStatus } from '../../../../base/interfaces/like-status.interface';
import { LikeDetailsViewModel } from '../../models/output/like-details-view.model';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';
import { ExtendedLikesInfoViewModel } from '../../models/output/extended-likes-info-view.model';

@Injectable()
export class PostsSqlRepository extends PostsRepository {
  constructor(
    private readonly postsConfig: PostsConfig,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super();
  }

  private async findLikes(
    postId: string,
    userId?: string,
  ): Promise<ExtendedLikesInfoViewModel> {
    const result = await this.dataSource.query(
      `SELECT likes.user_id AS "userId", likes.added_at AS "addedAt", likes.status, users.login
       FROM public."Likes" likes
       LEFT OUTER JOIN public."Users" users 
       ON likes.user_id = users.id
       WHERE likes.post_id = $1
       ORDER BY likes.added_at DESC`,
      [postId],
    );

    const likes = result.filter(
      (like: LikeDetailsViewModel & { status: ILikeStatus }): boolean =>
        like.status.trim() === ILikeStatus.LIKE,
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
      myStatus: like?.status?.trim() ?? ILikeStatus.NONE,
      newestLikes: likes.slice(0, this.postsConfig.newestLikesLength).map(
        (like: LikeDetailsViewModel): LikeDetailsViewModel => ({
          login: like.login,
          userId: like.userId,
          addedAt: like.addedAt,
        }),
      ),
    };
  }

  async findPosts(
    params: IPaginationParams,
    userId?: string,
  ): Promise<IPagination<PostViewModel>> {
    const sort: string[] = [];
    const skip: string[] = [];
    const values: string[] = [];
    const filters: string[] = [];
    const offset = (params.pageNumber - 1) * params.pageSize;

    if (params.blogId) {
      values.push(params.blogId);
      filters.push(`blog_id = $${values.length}`);
    }

    const where = !filters.length ? '' : `WHERE ${filters}`;
    const count = await this.dataSource.query(
      `SELECT COUNT(*) FROM public."Posts" ${where}`,
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
       posts.id, 
       posts.title, 
       posts.short_description AS "shortDescription", 
       posts.content, 
       posts.blog_id AS "blogId", 
       posts.created_at AS "createdAt", 
       blogs.name AS "blogName"
       FROM public."Posts" posts
       LEFT OUTER JOIN public."Blogs" blogs 
       ON posts.blog_id = blogs.id
       ${where}
       ${orderBy}
       ${limit}`,
      values,
    );

    const items = await Promise.all(
      result.map(async (post: PostViewModel): Promise<PostViewModel> => {
        const extendedLikesInfo = await this.findLikes(post.id, userId);

        return {
          ...post,
          extendedLikesInfo,
        };
      }),
    );

    return {
      items,
      totalCount,
      pagesCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
    };
  }

  async findPost(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    const result = await this.dataSource.query(
      `SELECT 
       posts.id, 
       posts.title, 
       posts.short_description AS "shortDescription", 
       posts.content, 
       posts.blog_id AS "blogId", 
       posts.created_at AS "createdAt", 
       blogs.name AS "blogName"
       FROM public."Posts" posts
       LEFT OUTER JOIN public."Blogs" blogs 
       ON posts.blog_id = blogs.id
       WHERE posts.id = $1`,
      [postId],
    );

    if (!result[0]) {
      return null;
    }

    const extendedLikesInfo = await this.findLikes(postId, userId);

    return {
      ...result[0],
      extendedLikesInfo,
    };
  }

  async createPost(dto: PostDto, blogName: string): Promise<PostViewModel> {
    const result = await this.dataSource.query(
      `INSERT INTO public."Posts" 
       (title, short_description, content, blog_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, short_description AS "shortDescription", content, blog_id AS "blogId", created_at AS "createdAt"`,
      [dto.title, dto.shortDescription, dto.content, dto.blogId],
    );

    const extendedLikesInfo = await this.findLikes(result[0].id);

    return {
      blogName,
      ...result[0],
      extendedLikesInfo,
    };
  }

  async updatePost(
    postId: string,
    dto: PostDto,
    blogName: string,
  ): Promise<PostViewModel | null> {
    const result = await this.dataSource.query(
      `UPDATE public."Posts"
       SET title = $2, short_description = $3, content = $4, blog_id = $5
       WHERE id = $1
       RETURNING id, title, short_description AS "shortDescription", content, blog_id AS "blogId", created_at AS "createdAt"`,
      [postId, dto.title, dto.shortDescription, dto.content, dto.blogId],
    );

    if (!result[0][0]) {
      return null;
    }

    const extendedLikesInfo = await this.findLikes(postId);

    return {
      blogName,
      ...result[0][0],
      extendedLikesInfo,
    };
  }

  async updateLike(
    postId: string,
    updateLikeDto: LikeDto,
    userId: string,
  ): Promise<PostViewModel | null> {
    const result = await this.dataSource.query(
      `SELECT 
       posts.id, 
       posts.title, 
       posts.short_description AS "shortDescription", 
       posts.content, 
       posts.blog_id AS "blogId", 
       posts.created_at AS "createdAt", 
       blogs.name AS "blogName"
       FROM public."Posts" posts
       LEFT OUTER JOIN public."Blogs" blogs 
       ON posts.blog_id = blogs.id
       WHERE posts.id = $1`,
      [postId],
    );

    if (!result[0]) {
      return null;
    }

    await this.dataSource.query(
      `DELETE FROM public."Likes"
       WHERE post_id = $1 AND user_id = $2`,
      [postId, userId],
    );

    if (updateLikeDto.likeStatus !== ILikeStatus.NONE) {
      await this.dataSource.query(
        `INSERT INTO public."Likes"
         (post_id, user_id, added_at, status)
         VALUES ($1, $2, $3, $4)`,
        [postId, userId, new Date().toISOString(), updateLikeDto.likeStatus],
      );
    }

    const extendedLikesInfo = await this.findLikes(postId, userId);

    return {
      ...result[0],
      extendedLikesInfo,
    };
  }

  async deletePost(postId: string): Promise<PostViewModel | null> {
    const result = await this.dataSource.query(
      `DELETE FROM public."Posts"
       WHERE id = $1
       RETURNING *`,
      [postId],
    );

    return result[0][0] ?? null;
  }

  async deleteAll(): Promise<void> {
    await this.dataSource.query('DELETE FROM public."Posts"');
  }
}
