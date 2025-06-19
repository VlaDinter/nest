import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { DeviceViewModel } from '../../users/models/output/device-view.model';
import { EditDeviceByUserIdCommand } from './commands/edit-device-by-user-id.command';

@CommandHandler(EditDeviceByUserIdCommand)
export class EditDeviceByUserIdUseCase
  implements ICommandHandler<EditDeviceByUserIdCommand, DeviceViewModel | null>
{
  constructor(private readonly usersService: UsersService) {}

  execute(command: EditDeviceByUserIdCommand): Promise<DeviceViewModel | null> {
    return this.usersService.editDevice(command.userId, command.deviceId);
  }
}
