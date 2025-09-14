import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesService } from '../../devices/application/devices.service';
import { DeviceViewModel } from '../../devices/models/output/device-view.model';
import { GetDeviceByUserIdCommand } from './commands/get-device-by-user-id.command';

@CommandHandler(GetDeviceByUserIdCommand)
export class GetDeviceByUserIdUseCase
  implements ICommandHandler<GetDeviceByUserIdCommand, DeviceViewModel | null>
{
  constructor(private readonly devicesService: DevicesService) {}

  execute(command: GetDeviceByUserIdCommand): Promise<DeviceViewModel | null> {
    return this.devicesService.getDevice(command.deviceId);
  }
}
