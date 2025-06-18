import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutUserCommand } from './commands/logout-user.command';
import { UsersService } from '../../users/application/users.service';
import { DeviceViewModel } from '../../users/models/output/device-view.model';

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase
  implements ICommandHandler<LogoutUserCommand, DeviceViewModel | null>
{
  constructor(private readonly usersService: UsersService) {}

  execute(command: LogoutUserCommand): Promise<DeviceViewModel | null> {
    return this.usersService.removeDevice(command.userId, command.deviceId);
  }
}
