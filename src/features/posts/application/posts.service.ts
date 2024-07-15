import { Injectable } from '@nestjs/common';
import { PostsMongooseRepository } from '../infrastructure/mongo-repository/posts.mongoose.repository';
import { PaginationType } from '../../../types/PaginationType';
import { PostViewModel } from '../view-models/post-view-model';
import { FiltersType } from '../../../types/FiltersType';
import { PostDto } from '../dto/Post.dto';
import { BlogsService } from '../../blogs/application/blogs.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsMongooseRepository,
    private readonly blogsService: BlogsService,
  ) {}

  getPosts(
    filters: FiltersType,
    blogId?: string,
  ): Promise<PaginationType<PostViewModel>> {
    return this.postsRepository.findPosts(filters, blogId);
  }

  getPost(postId: string): Promise<PostViewModel | null> {
    return this.postsRepository.findPost(postId);
  }

  async addPost(createPostDto: PostDto): Promise<PostViewModel> {
    const blog = await this.blogsService.getBlog(createPostDto.blogId);

    return this.postsRepository.createPost(createPostDto, blog?.name || 'Name');
  }

  async editPost(
    postId: string,
    updatePostDto: PostDto,
  ): Promise<PostViewModel | null> {
    const blog = await this.blogsService.getBlog(updatePostDto.blogId);

    return this.postsRepository.updatePost(
      postId,
      updatePostDto,
      blog?.name || 'Name',
    );
  }

  removePost(postId: string): Promise<PostViewModel | null> {
    return this.postsRepository.deletePost(postId);
  }

  async removeAll(): Promise<void> {
    await this.postsRepository.deleteAll();
  }
}
