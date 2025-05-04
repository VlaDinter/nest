import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../../users/application/users.service';
import { PostsService } from '../posts.service';
import { PostViewModel } from '../../view-models/post-view-model';
import { LikeDto } from '../../../comments/dto/like.dto';

export class EditPostWithUserLoginCommand {
  constructor(
    public readonly postId: string,
    public readonly updateLikeDto: LikeDto,
    public readonly userId: string,
  ) {}
}

@CommandHandler(EditPostWithUserLoginCommand)
export class EditPostWithUserLoginUseCase
  implements ICommandHandler<EditPostWithUserLoginCommand>
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
