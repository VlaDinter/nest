import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesService } from '../../devices/application/devices.service';
import { DeviceViewModel } from '../../devices/models/output/device-view.model';
import { EditDeviceByUserIdCommand } from './commands/edit-device-by-user-id.command';

@CommandHandler(EditDeviceByUserIdCommand)
export class EditDeviceByUserIdUseCase
  implements ICommandHandler<EditDeviceByUserIdCommand, DeviceViewModel | null>
{
  constructor(private readonly devicesService: DevicesService) {}

  execute(command: EditDeviceByUserIdCommand): Promise<DeviceViewModel | null> {
    return this.devicesService.editDevice(command.userId, command.deviceId);
  }
}
