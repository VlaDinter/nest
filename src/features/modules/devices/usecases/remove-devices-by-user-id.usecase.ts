import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '@modules/users/application/users.service';
import { DeviceViewModel } from '@modules/users/models/output/device-view.model';
import { RemoveDevicesByUserIdCommand } from '@modules/devices/usecases/commands/remove-devices-by-user-id.command';

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
