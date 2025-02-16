import { Injectable } from '@nestjs/common';
import { PostsMongooseRepository } from '../infrastructure/mongo-repository/posts.mongoose.repository';
import { PostViewModel } from '../view-models/post-view-model';
import { PostDto } from '../dto/Post.dto';
import { BlogsService } from '../../blogs/application/blogs.service';
import { PaginationInterface } from '../../../interfaces/pagination.interface';
import { FiltersInterface } from '../../../interfaces/filters.interface';
import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PostInputModelType {
  @MaxLength(30)
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  title: string;
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  shortDescription: string;
  @MaxLength(1000)
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  content: string;
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  blogId: string;
}

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsMongooseRepository,
    private readonly blogsService: BlogsService,
  ) {}

  getPosts(
    filters: FiltersInterface,
    blogId?: string,
  ): Promise<PaginationInterface<PostViewModel>> {
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
