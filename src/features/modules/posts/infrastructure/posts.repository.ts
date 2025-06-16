import { PostDto } from '@modules/posts/dto/post.dto';
import { LikeDto } from '@modules/comments/dto/like.dto';
import { PostViewModel } from '@modules/posts/models/output/post-view.model';
import { IPagination } from '@src/features/base/interfaces/pagination.interface';
import { IPaginationParams } from '@src/features/base/interfaces/pagination-params.interface';

export abstract class PostsRepository {
  abstract findPosts(
    filters: IPaginationParams,
    userId?: string,
  ): Promise<IPagination<PostViewModel>>;
  abstract findPost(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null>;
  abstract createPost(
    createPostDto: PostDto,
    blogName: string,
  ): Promise<PostViewModel>;
  abstract updatePost(
    postId: string,
    updatePostDto: PostDto,
    blogName: string,
  ): Promise<PostViewModel | null>;
  abstract updateLike(
    postId: string,
    updateLikeDto: LikeDto,
    userId: string,
    userLogin: string,
  ): Promise<PostViewModel | null>;
  abstract deletePost(postId: string): Promise<PostViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
