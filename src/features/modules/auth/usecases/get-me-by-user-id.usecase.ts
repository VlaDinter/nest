import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '@modules/users/application/users.service';
import { UserViewModel } from '@modules/users/models/output/user-view.model';
import { GetMeByUserIdCommand } from '@modules/auth/usecases/commands/get-me-by-user-id.command';

@CommandHandler(GetMeByUserIdCommand)
export class GetMeByUserIdUseCase
  implements ICommandHandler<GetMeByUserIdCommand, UserViewModel | null>
{
  constructor(private readonly usersService: UsersService) {}

  execute(command: GetMeByUserIdCommand): Promise<UserViewModel | null> {
    return this.usersService.getUser(command.userId);
  }
}
