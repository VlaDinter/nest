import {
  Req,
  Get,
  Put,
  Body,
  Post,
  Query,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { PostsService } from '../application/posts.service';
import { PostViewModel } from '../models/output/post-view.model';
import { PostInputModel } from '../models/input/post-input.model';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { ParseStringPipe } from '../../../common/pipes/parse-string.pipe';
import { ParseNumberPipe } from '../../../common/pipes/parse-number.pipe';
import { ParseValuesPipe } from '../../../common/pipes/parse-values.pipe';
import { getConfiguration } from '../../../../configuration/configuration';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { JwtAuthGuard } from '../../../common/guards/bearer/jwt-auth.guard';
import { LikeInputModel } from '../../comments/models/input/like-input.model';
import { BasicAuthGuard } from '../../../common/guards/basic/basic-auth.guard';
import { CommentViewModel } from '../../comments/models/output/comment-view.model';
import { CommentInputModel } from '../../comments/models/input/comment-input.model';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { ISortDirections } from '../../../base/interfaces/sort-directions.interface';
import { ObjectIdValidationPipe } from '../../../common/pipes/object-id-validation.pipe';
import { GetCommentsByPostIdCommand } from '../usecases/commands/get-comments-by-post-id.command';
import { AddPostWithBlogNameCommand } from '../usecases/commands/add-post-with-blog-name.command';
import { AddCommentWithPostIdCommand } from '../usecases/commands/add-comment-with-post-id.command';
import { EditPostWithBlogNameCommand } from '../usecases/commands/edit-post-with-blog-name.command';
import { EditPostWithUserLoginCommand } from '../usecases/commands/edit-post-with-user-login.command';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsService: PostsService,
  ) {}

  @Api('Get posts')
  @Get()
  getPosts(
    @Req() req: Request,
    @Query(
      'pageSize',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageSize),
    )
    pageSize: number,
    @Query(
      'pageNumber',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageNumber),
    )
    pageNumber: number,
    @Query(
      'sortBy',
      ParseStringPipe,
      new DefaultValuePipe(getConfiguration().sortBy),
    )
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new ParseValuesPipe([ISortDirections.ASC, ISortDirections.DESC]),
      new DefaultValuePipe(getConfiguration().sortDirection),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<PostViewModel>> {
    return this.postsService.getPosts(
      {
        sortBy,
        pageSize,
        pageNumber,
        sortDirection,
      },
      req.user?.['userId'],
    );
  }

  @Api('Get post', true)
  @Get(':id')
  async getPost(
    @Req() req: Request,
    @Param('id', ObjectIdValidationPipe) postId: string,
  ): Promise<PostViewModel | void> {
    const foundPost = await this.postsService.getPost(
      postId,
      req.user?.['userId'],
    );

    if (!foundPost) {
      throw new NotFoundException('Post not found');
    }

    return foundPost;
  }

  @Api('Post posts', false, true)
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async postPosts(@Body() inputModel: PostInputModel): Promise<PostViewModel> {
    const command = new AddPostWithBlogNameCommand(inputModel);
    const createdPost = await this.commandBus.execute<
      AddPostWithBlogNameCommand,
      PostViewModel | null
    >(command);

    if (!createdPost) {
      throw new NotFoundException('Blog not found');
    }

    return createdPost;
  }

  @Api('Put post', true, true)
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putPost(
    @Body() inputModel: PostInputModel,
    @Param('id', ObjectIdValidationPipe) postId: string,
  ): Promise<void> {
    const command = new EditPostWithBlogNameCommand(postId, inputModel);
    const updatedPost = await this.commandBus.execute<
      EditPostWithBlogNameCommand,
      PostViewModel | null
    >(command);

    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }
  }

  @Api('Put like status', true, false, true)
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putLikeStatus(
    @Body() inputModel: LikeInputModel,
    @CurrentUserId() currentUserId: string,
    @Param('id', ObjectIdValidationPipe) postId: string,
  ): Promise<void> {
    const command = new EditPostWithUserLoginCommand(
      postId,
      inputModel,
      currentUserId,
    );

    const updatedPost = await this.commandBus.execute<
      EditPostWithUserLoginCommand,
      PostViewModel | null
    >(command);

    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }
  }

  @Api('Delete post', true, true)
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ObjectIdValidationPipe) postId: string,
  ): Promise<void> {
    const deletedPost = await this.postsService.removePost(postId);

    if (!deletedPost) {
      throw new NotFoundException('Post not found');
    }
  }

  @Api('Get comments', true)
  @Get(':id/comments')
  async getComments(
    @Req() req: Request,
    @Param('id', ObjectIdValidationPipe) postId: string,
    @Query(
      'pageSize',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageSize),
    )
    pageSize: number,
    @Query(
      'pageNumber',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageNumber),
    )
    pageNumber: number,
    @Query(
      'sortBy',
      ParseStringPipe,
      new DefaultValuePipe(getConfiguration().sortBy),
    )
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new ParseValuesPipe([ISortDirections.ASC, ISortDirections.DESC]),
      new DefaultValuePipe(getConfiguration().sortDirection),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<CommentViewModel>> {
    const command = new GetCommentsByPostIdCommand(
      {
        postId,
        sortBy,
        pageSize,
        pageNumber,
        sortDirection,
      },
      req.user?.['userId'],
    );

    const foundComments = await this.commandBus.execute<
      GetCommentsByPostIdCommand,
      IPagination<CommentViewModel> | null
    >(command);

    if (!foundComments) {
      throw new NotFoundException('Post not found');
    }

    return foundComments;
  }

  @Api('Post comments', true, false, true)
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async postComments(
    @Body() inputModel: CommentInputModel,
    @CurrentUserId() currentUserId: string,
    @Param('id', ObjectIdValidationPipe) postId: string,
  ): Promise<CommentViewModel> {
    const command = new AddCommentWithPostIdCommand(
      inputModel,
      postId,
      currentUserId,
    );

    const createdComment = await this.commandBus.execute<
      AddCommentWithPostIdCommand,
      CommentViewModel | null
    >(command);

    if (!createdComment) {
      throw new NotFoundException('Post not found');
    }

    return createdComment;
  }
}
