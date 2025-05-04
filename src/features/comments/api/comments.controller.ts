import {
  Controller,
  Get,
  Param,
  NotFoundException,
  ForbiddenException,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
  Delete,
  Put,
  Request,
} from '@nestjs/common';
import { CommentViewModel } from '../view-models/comment-view-model';
import {
  CommentInputModelType,
  CommentsService,
  LikeInputModelType,
} from '../application/comments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../current-user-id.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { EditCommentWithUserLoginCommand } from '../application/use-cases/edit-comment-with-user-login-use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  async getComment(
    @Request() req,
    @Param('id') commentId: string,
  ): Promise<CommentViewModel | void> {
    const foundComment = await this.commentsService.getComment(
      commentId,
      req.user.userId,
    );

    if (!foundComment) {
      throw new NotFoundException('Comment not found');
    }

    return foundComment;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putComment(
    @Param('commentId') commentId: string,
    @Body() inputModel: CommentInputModelType,
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    const comment = await this.commentsService.getComment(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.commentatorInfo.userId !== currentUserId) {
      throw new ForbiddenException();
    }

    await this.commentsService.editComment(commentId, inputModel);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putLikeStatus(
    @Param('commentId') commentId: string,
    @Body() inputModel: LikeInputModelType,
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    const updatedComment = await this.commandBus.execute(
      new EditCommentWithUserLoginCommand(commentId, inputModel, currentUserId),
    );

    if (!updatedComment) {
      throw new NotFoundException('Comment not found');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @CurrentUserId() currentUserId: string,
    @Param('commentId') commentId: string,
  ): Promise<void> {
    const comment = await this.commentsService.getComment(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.commentatorInfo.userId !== currentUserId) {
      throw new ForbiddenException();
    }

    await this.commentsService.removeComment(commentId);
  }
}
