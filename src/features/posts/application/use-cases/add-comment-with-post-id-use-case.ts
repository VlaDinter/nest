import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../posts.service';
import { CommentDto } from '../../../comments/dto/comment.dto';
import { CommentViewModel } from '../../../comments/view-models/comment-view-model';
import { CommentsService } from '../../../comments/application/comments.service';
import { UsersService } from '../../../users/application/users.service';

export class AddCommentWithPostIdCommand {
  constructor(
    public readonly createCommentDto: CommentDto,
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(AddCommentWithPostIdCommand)
export class AddCommentWithPostIdUseCase
  implements ICommandHandler<AddCommentWithPostIdCommand>
{
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  async execute(
    command: AddCommentWithPostIdCommand,
  ): Promise<CommentViewModel | null> {
    const user = await this.usersService.getUser(command.userId);
    const post = await this.postsService.getPost(command.postId);

    if (!user || !post) {
      return null;
    }

    return this.commentsService.addComment(
      command.createCommentDto,
      post.id,
      user.id,
      user.login,
    );
  }
}
