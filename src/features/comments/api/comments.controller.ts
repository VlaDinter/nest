import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CommentViewModel } from '../view-models/comment-view-model';
import { CommentsService } from '../application/comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  async getComment(
    @Param('id') commentId: string,
  ): Promise<CommentViewModel | void> {
    const foundComment = await this.commentsService.getComment(commentId);

    if (!foundComment) {
      throw new NotFoundException('Comment not found');
    }

    return foundComment;
  }
}
