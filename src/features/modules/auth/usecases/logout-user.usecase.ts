import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '@modules/users/application/users.service';
import { DeviceViewModel } from '@modules/users/models/output/device-view.model';
import { LogoutUserCommand } from '@modules/auth/usecases/commands/logout-user.command';

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase
  implements ICommandHandler<LogoutUserCommand, DeviceViewModel | null>
{
  constructor(private readonly usersService: UsersService) {}

  execute(command: LogoutUserCommand): Promise<DeviceViewModel | null> {
    return this.usersService.removeDevice(command.userId, command.deviceId);
  }
}
