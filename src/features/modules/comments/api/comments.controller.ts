import {
  Req,
  Get,
  Put,
  Body,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { LikeInputModel } from '../models/input/like-input.model';
import { CommentsService } from '../application/comments.service';
import { CommentViewModel } from '../models/output/comment-view.model';
import { CommentInputModel } from '../models/input/comment-input.model';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { JwtAuthGuard } from '../../../common/guards/bearer/jwt-auth.guard';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { ObjectIdValidationPipe } from '../../../common/pipes/object-id-validation.pipe';
import { EditCommentWithUserLoginCommand } from '../usecases/commands/edit-comment-with-user-login.command';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsService: CommentsService,
  ) {}

  @Api('Get comment', true)
  @Get(':id')
  async getComment(
    @Req() req: Request,
    @Param('id', ObjectIdValidationPipe) commentId: string,
  ): Promise<CommentViewModel | void> {
    const foundComment = await this.commentsService.getComment(
      commentId,
      req.user?.['userId'],
    );

    if (!foundComment) {
      throw new NotFoundException('Comment not found');
    }

    return foundComment;
  }

  @Api('Put comment', true, false, true)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putComment(
    @Body() inputModel: CommentInputModel,
    @CurrentUserId() currentUserId: string,
    @Param('id', ObjectIdValidationPipe) commentId: string,
  ): Promise<void> {
    const comment = await this.commentsService.getComment(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.commentatorInfo.userId !== currentUserId) {
      throw new ForbiddenException('Comment not found');
    }

    await this.commentsService.editComment(commentId, inputModel);
  }

  @Api('Put like status', true, false, true)
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putLikeStatus(
    @Body() inputModel: LikeInputModel,
    @CurrentUserId() currentUserId: string,
    @Param('id', ObjectIdValidationPipe) commentId: string,
  ): Promise<void> {
    const command = new EditCommentWithUserLoginCommand(
      commentId,
      inputModel,
      currentUserId,
    );

    const updatedComment = await this.commandBus.execute<
      EditCommentWithUserLoginCommand,
      CommentViewModel | null
    >(command);

    if (!updatedComment) {
      throw new NotFoundException('Comment not found');
    }
  }

  @Api('Delete comment', true, false, true)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @CurrentUserId() currentUserId: string,
    @Param('id', ObjectIdValidationPipe) commentId: string,
  ): Promise<void> {
    const comment = await this.commentsService.getComment(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.commentatorInfo.userId !== currentUserId) {
      throw new ForbiddenException('Comment not found');
    }

    await this.commentsService.removeComment(commentId);
  }
}
