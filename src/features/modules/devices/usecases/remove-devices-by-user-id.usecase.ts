import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { DeviceViewModel } from '../../users/models/output/device-view.model';
import { RemoveDevicesByUserIdCommand } from './commands/remove-devices-by-user-id.command';

@CommandHandler(RemoveDevicesByUserIdCommand)
export class RemoveDevicesByUserIdUseCase
  implements
    ICommandHandler<RemoveDevicesByUserIdCommand, DeviceViewModel | null>
{
  constructor(private readonly usersService: UsersService) {}

  execute(
    command: RemoveDevicesByUserIdCommand,
  ): Promise<DeviceViewModel | null> {
    return this.usersService.removeDevices(command.userId, command.deviceId);
  }
}
