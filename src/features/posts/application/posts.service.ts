import { Injectable } from '@nestjs/common';
import { PostsMongooseRepository } from '../infrastructure/mongo-repository/posts.mongoose.repository';
import { PostViewModel } from '../view-models/post-view-model';
import { PostDto } from '../dto/Post.dto';
import { IPagination } from '../../../interfaces/pagination.interface';
import { IFilters } from '../../../interfaces/filters.interface';
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
  constructor(private readonly postsRepository: PostsMongooseRepository) {}

  getPosts(
    filters: IFilters,
    blogId?: string,
  ): Promise<IPagination<PostViewModel>> {
    return this.postsRepository.findPosts(filters, blogId);
  }

  getPost(postId: string): Promise<PostViewModel | null> {
    return this.postsRepository.findPost(postId);
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

  removePost(postId: string): Promise<PostViewModel | null> {
    return this.postsRepository.deletePost(postId);
  }

  async removeAll(): Promise<void> {
    await this.postsRepository.deleteAll();
  }
}
