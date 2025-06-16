import { Inject, Injectable } from '@nestjs/common';
import { PostDto } from '@modules/posts/dto/post.dto';
import { LikeDto } from '@modules/comments/dto/like.dto';
import { PostViewModel } from '@modules/posts/models/output/post-view.model';
import { PostsRepository } from '@modules/posts/infrastructure/posts.repository';
import { IPagination } from '@src/features/base/interfaces/pagination.interface';
import { IPaginationParams } from '@src/features/base/interfaces/pagination-params.interface';

@Injectable()
export class PostsService {
  constructor(
    @Inject('PostsRepository')
    private readonly postsRepository: PostsRepository,
  ) {}

  getPosts(
    params: IPaginationParams,
    userId?: string,
  ): Promise<IPagination<PostViewModel>> {
    return this.postsRepository.findPosts(params, userId);
  }

  getPost(postId: string, userId?: string): Promise<PostViewModel | null> {
    return this.postsRepository.findPost(postId, userId);
  }

  addPost(createPostDto, blogName): Promise<PostViewModel> {
    return this.postsRepository.createPost(createPostDto, blogName);
  }

  async editPost(
    postId: string,
    updatePostDto: PostDto,
    blogName: string,
  ): Promise<PostViewModel | null> {
    return this.postsRepository.updatePost(postId, updatePostDto, blogName);
  }

  editLike(
    postId: string,
    updateLikeDto: LikeDto,
    userId: string,
    userLogin: string,
  ): Promise<PostViewModel | null> {
    return this.postsRepository.updateLike(
      postId,
      updateLikeDto,
      userId,
      userLogin,
    );
  }

  removePost(postId: string): Promise<PostViewModel | null> {
    return this.postsRepository.deletePost(postId);
  }

  async removeAll(): Promise<void> {
    await this.postsRepository.deleteAll();
  }
}
