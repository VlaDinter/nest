import { PostDto } from '../dto/post.dto';
import { LikeDto } from '../../comments/dto/like.dto';
import { PostViewModel } from '../models/output/post-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

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
