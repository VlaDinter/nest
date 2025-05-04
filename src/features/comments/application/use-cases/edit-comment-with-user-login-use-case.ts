import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../../users/application/users.service';
import { LikeDto } from '../../dto/like.dto';
import { CommentsService } from '../comments.service';
import { CommentViewModel } from '../../view-models/comment-view-model';

export class EditCommentWithUserLoginCommand {
  constructor(
    public readonly commentId: string,
    public readonly updateLikeDto: LikeDto,
    public readonly userId: string,
  ) {}
}

@CommandHandler(EditCommentWithUserLoginCommand)
export class EditCommentWithUserLoginUseCase
  implements ICommandHandler<EditCommentWithUserLoginCommand>
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
