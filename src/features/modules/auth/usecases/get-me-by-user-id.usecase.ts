import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { UserViewModel } from '../../users/models/output/user-view.model';
import { GetMeByUserIdCommand } from './commands/get-me-by-user-id.command';

@CommandHandler(GetMeByUserIdCommand)
export class GetMeByUserIdUseCase
  implements ICommandHandler<GetMeByUserIdCommand, UserViewModel | null>
{
  constructor(private readonly usersService: UsersService) {}

  execute(command: GetMeByUserIdCommand): Promise<UserViewModel | null> {
    return this.usersService.getUser(command.userId);
  }
}
