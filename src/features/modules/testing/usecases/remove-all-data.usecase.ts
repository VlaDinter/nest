import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '@modules/users/application/users.service';
import { BlogsService } from '@modules/blogs/application/blogs.service';
import { PostsService } from '@modules/posts/application/posts.service';
import { CommentsService } from '@modules/comments/application/comments.service';
import { RemoveAllDataCommand } from '@modules/testing/usecases/commands/remove-all-data.command';

@CommandHandler(RemoveAllDataCommand)
export class RemoveAllDataUseCase
  implements ICommandHandler<RemoveAllDataCommand, void>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  async execute(): Promise<void> {
    await this.usersService.removeAll();
    await this.blogsService.removeAll();
    await this.postsService.removeAll();
    await this.commentsService.removeAll();
  }
}
