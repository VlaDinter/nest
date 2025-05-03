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
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PostViewModel } from '../view-models/post-view-model';
import { PostInputModelType, PostsService } from '../application/posts.service';
import { CommentViewModel } from '../../comments/view-models/comment-view-model';
import { CommentsService } from '../../comments/application/comments.service';
import { IPagination } from '../../../interfaces/pagination.interface';
import { ParseStringPipe } from '../../../parse-string.pipe';
import { ISortDirections } from '../../../interfaces/sort-directions.interface';
import { AddPostWithBlogNameCommand } from '../application/use-cases/add-post-with-blog-name-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { EditPostWithBlogNameCommand } from '../application/use-cases/edit-post-with-blog-name-use-case';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  getPosts(
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('sortBy', ParseStringPipe, new DefaultValuePipe('createdAt'))
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new DefaultValuePipe(ISortDirections.DESC),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<PostViewModel>> {
    return this.postsService.getPosts({
      sortDirection,
      pageNumber,
      pageSize,
      sortBy,
    });
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
  async postPosts(
    @Body() inputModel: PostInputModelType,
  ): Promise<PostViewModel> {
    const createdPost = await this.commandBus.execute(
      new AddPostWithBlogNameCommand(inputModel),
    );

    if (!createdPost) {
      throw new NotFoundException('Blog not found');
    }

    return createdPost;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putPost(
    @Param('id') postId: string,
    @Body() inputModel: PostInputModelType,
  ): Promise<void> {
    const updatedPost = await this.commandBus.execute(
      new EditPostWithBlogNameCommand(postId, inputModel),
    );

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
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('sortBy', ParseStringPipe, new DefaultValuePipe('createdAt'))
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new DefaultValuePipe(ISortDirections.DESC),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<CommentViewModel>> {
    const foundPost = await this.postsService.getPost(postId);

    if (!foundPost) {
      throw new NotFoundException('Post not found');
    }

    return this.commentsService.getComments({
      sortDirection,
      pageNumber,
      pageSize,
      sortBy,
    });
  }
}
