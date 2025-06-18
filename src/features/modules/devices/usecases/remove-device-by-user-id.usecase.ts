import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { DeviceViewModel } from '../../users/models/output/device-view.model';
import { RemoveDeviceByUserIdCommand } from './commands/remove-device-by-user-id.command';

@CommandHandler(RemoveDeviceByUserIdCommand)
export class RemoveDeviceByUserIdUseCase
  implements
    ICommandHandler<RemoveDeviceByUserIdCommand, DeviceViewModel | null>
{
  constructor(private readonly usersService: UsersService) {}

  execute(
    command: RemoveDeviceByUserIdCommand,
  ): Promise<DeviceViewModel | null> {
    return this.usersService.removeDevice(command.userId, command.deviceId);
  }
}
