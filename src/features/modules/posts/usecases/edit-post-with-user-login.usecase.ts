import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../application/posts.service';
import { PostViewModel } from '../models/output/post-view.model';
import { UsersService } from '../../users/application/users.service';
import { EditPostWithUserLoginCommand } from './commands/edit-post-with-user-login.command';

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
