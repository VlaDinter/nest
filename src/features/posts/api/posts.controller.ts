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
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostViewModel } from '../view-models/post-view-model';
import { PostInputModelType, PostsService } from '../application/posts.service';
import { CommentViewModel } from '../../comments/view-models/comment-view-model';
import {
  CommentInputModelType,
  LikeInputModelType,
} from '../../comments/application/comments.service';
import { IPagination } from '../../../interfaces/pagination.interface';
import { ParseStringPipe } from '../../../parse-string.pipe';
import { ISortDirections } from '../../../interfaces/sort-directions.interface';
import { CommandBus } from '@nestjs/cqrs';
import { EditPostWithBlogNameCommand } from '../application/use-cases/edit-post-with-blog-name-use-case';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../current-user-id.decorator';
import { AddCommentWithPostIdCommand } from '../application/use-cases/add-comment-with-post-id-use-case';
import { EditPostWithUserLoginCommand } from '../application/use-cases/edit-post-with-user-login-use-case';
import { GetCommentsByPostIdCommand } from '../application/use-cases/get-comments-by-post-id-use-case';
import { AddPostWithBlogNameCommand } from '../application/use-cases/add-post-with-blog-name-use-case';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
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
    @Request() req,
  ): Promise<IPagination<PostViewModel>> {
    return this.postsService.getPosts(
      {
        sortDirection,
        pageNumber,
        pageSize,
        sortBy,
      },
      req.user.userId,
    );
  }

  @Get(':id')
  async getPost(
    @Param('id') postId: string,
    @Request() req,
  ): Promise<PostViewModel | void> {
    const foundPost = await this.postsService.getPost(postId, req.user.userId);

    if (!foundPost) {
      throw new NotFoundException('Post not found');
    }

    return foundPost;
  }

  @UseGuards(BasicAuthGuard)
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

  @UseGuards(BasicAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putLikeStatus(
    @Param('postId') postId: string,
    @Body() inputModel: LikeInputModelType,
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    const updatedPost = await this.commandBus.execute(
      new EditPostWithUserLoginCommand(postId, inputModel, currentUserId),
    );

    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }
  }

  @UseGuards(BasicAuthGuard)
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
    @Request() req,
  ): Promise<IPagination<CommentViewModel>> {
    const foundComments = await this.commandBus.execute(
      new GetCommentsByPostIdCommand(
        {
          postId,
          sortDirection,
          pageNumber,
          pageSize,
          sortBy,
        },
        req.user.userId,
      ),
    );

    if (!foundComments) {
      throw new NotFoundException('Post not found');
    }

    return foundComments;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async postComments(
    @CurrentUserId() currentUserId: string,
    @Param('postId') postId: string,
    @Body() inputModel: CommentInputModelType,
  ): Promise<CommentViewModel> {
    const createdComment = await this.commandBus.execute(
      new AddCommentWithPostIdCommand(inputModel, postId, currentUserId),
    );

    if (!createdComment) {
      throw new NotFoundException('Post not found');
    }

    return createdComment;
  }
}
