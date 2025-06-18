import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsService } from '../application/comments.service';
import { UsersService } from '../../users/application/users.service';
import { CommentViewModel } from '../models/output/comment-view.model';
import { EditCommentWithUserLoginCommand } from './commands/edit-comment-with-user-login.command';

@CommandHandler(EditCommentWithUserLoginCommand)
export class EditCommentWithUserLoginUseCase
  implements
    ICommandHandler<EditCommentWithUserLoginCommand, CommentViewModel | null>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly commentsService: CommentsService,
  ) {}

  async execute(
    command: EditCommentWithUserLoginCommand,
  ): Promise<CommentViewModel | null> {
    const user = await this.usersService.getUser(command.userId);

    if (!user) {
      return null;
    }

    return this.commentsService.editLike(
      command.commentId,
      command.updateLikeDto,
      user.id,
      user.login,
    );
  }
}
