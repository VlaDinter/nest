import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { BlogsService } from '../../blogs/application/blogs.service';
import { PostsService } from '../../posts/application/posts.service';
import { RemoveAllDataCommand } from './commands/remove-all-data.command';
import { DevicesService } from '../../devices/application/devices.service';
import { CommentsService } from '../../comments/application/comments.service';

@CommandHandler(RemoveAllDataCommand)
export class RemoveAllDataUseCase
  implements ICommandHandler<RemoveAllDataCommand, void>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly devicesService: DevicesService,
    private readonly commentsService: CommentsService,
  ) {}

  async execute(): Promise<void> {
    await this.usersService.removeAll();
    await this.blogsService.removeAll();
    await this.postsService.removeAll();
    await this.devicesService.removeAll();
    await this.commentsService.removeAll();
  }
}
