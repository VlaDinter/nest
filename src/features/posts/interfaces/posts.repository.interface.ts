import { PostViewModel } from '../view-models/post-view-model';
import { PostDto } from '../dto/Post.dto';
import { PaginationInterface } from '../../../interfaces/pagination.interface';
import { FiltersInterface } from '../../../interfaces/filters.interface';

export abstract class IPostsRepository {
  abstract findPosts(
    filters: FiltersInterface,
  ): Promise<PaginationInterface<PostViewModel>>;
  abstract findPost(postId: string): Promise<PostViewModel | null>;
  abstract createPost(
    createPostDto: PostDto,
    blogName: string,
  ): Promise<PostViewModel>;
  abstract updatePost(
    postId: string,
    updatePostDto: PostDto,
    blogName: string,
  ): Promise<PostViewModel | null>;
  abstract deletePost(postId: string): Promise<PostViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
