import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '@modules/users/application/users.service';
import { PostsService } from '@modules/posts/application/posts.service';
import { PostViewModel } from '@modules/posts/models/output/post-view.model';
import { EditPostWithUserLoginCommand } from '@modules/posts/usecases/commands/edit-post-with-user-login.command';

@CommandHandler(EditPostWithUserLoginCommand)
export class EditPostWithUserLoginUseCase
  implements
    ICommandHandler<EditPostWithUserLoginCommand, PostViewModel | null>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  async execute(
    command: EditPostWithUserLoginCommand,
  ): Promise<PostViewModel | null> {
    const user = await this.usersService.getUser(command.userId);

    if (!user) {
      return null;
    }

    return this.postsService.editLike(
      command.postId,
      command.updateLikeDto,
      user.id,
      user.login,
    );
  }
}
