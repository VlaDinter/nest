import {
  Put,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  HttpCode,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { PostViewModel } from '../view-models/post-view-model';
import { PostInputModelType, PostsService } from '../application/posts.service';
import { CommentViewModel } from '../../comments/view-models/comment-view-model';
import { CommentsService } from '../../comments/application/comments.service';
import { PaginationInterface } from '../../../interfaces/pagination.interface';
import { FiltersInterface } from '../../../interfaces/filters.interface';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  getPosts(
    @Query() filters: FiltersInterface,
  ): Promise<PaginationInterface<PostViewModel>> {
    return this.postsService.getPosts(filters);
  }

  @Get(':id')
  async getPost(@Param('id') postId: string): Promise<PostViewModel | void> {
    const foundPost = await this.postsService.getPost(postId);

    if (!foundPost) {
      throw new NotFoundException('Post not found');
    }

    return foundPost;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  postPosts(@Body() inputModel: PostInputModelType): Promise<PostViewModel> {
    return this.postsService.addPost(inputModel);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putPost(
    @Param('id') postId: string,
    @Body() inputModel: PostInputModelType
  ): Promise<void> {
    const updatedPost = await this.postsService.editPost(postId, inputModel);

    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string): Promise<void> {
    const deletedPost = await this.postsService.removePost(postId);

    if (!deletedPost) {
      throw new NotFoundException('Post not found');
    }
  }

  @Get(':postId/comments')
  async getComments(
    @Param('postId') postId: string,
    @Query() filters: FiltersInterface,
  ): Promise<PaginationInterface<CommentViewModel>> {
    const foundPost = await this.postsService.getPost(postId);

    if (!foundPost) {
      throw new NotFoundException('Post not found');
    }

    return this.commentsService.getComments(filters);
  }
}
