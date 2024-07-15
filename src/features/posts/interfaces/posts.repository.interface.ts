import { PaginationType } from '../../../types/PaginationType';
import { PostViewModel } from '../view-models/post-view-model';
import { FiltersType } from '../../../types/FiltersType';
import { PostDto } from '../dto/Post.dto';

export abstract class IPostsRepository {
  abstract findPosts(
    filters: FiltersType,
  ): Promise<PaginationType<PostViewModel>>;
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
