import { Optional } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesService } from '../../quiz/application/games.service';
import { UsersService } from '../../users/application/users.service';
import { QuestionsService } from '../../quiz/application/questions.service';
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
    @Optional() private readonly gamesService?: GamesService,
    @Optional() private readonly questionsService?: QuestionsService,
  ) {}

  async execute(): Promise<void> {
    await this.gamesService?.removeAll();
    await this.questionsService?.removeAll();
    await this.usersService.removeAll();
    await this.blogsService.removeAll();
    await this.postsService.removeAll();
    await this.devicesService.removeAll();
    await this.commentsService.removeAll();
  }
}
