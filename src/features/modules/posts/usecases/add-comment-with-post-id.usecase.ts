import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '@modules/users/application/users.service';
import { PostsService } from '@modules/posts/application/posts.service';
import { CommentsService } from '@modules/comments/application/comments.service';
import { CommentViewModel } from '@modules/comments/models/output/comment-view.model';
import { AddCommentWithPostIdCommand } from '@modules/posts/usecases/commands/add-comment-with-post-id.command';

@CommandHandler(AddCommentWithPostIdCommand)
export class AddCommentWithPostIdUseCase
  implements
    ICommandHandler<AddCommentWithPostIdCommand, CommentViewModel | null>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
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
