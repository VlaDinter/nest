import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutUserCommand } from './commands/logout-user.command';
import { DevicesService } from '../../devices/application/devices.service';
import { DeviceViewModel } from '../../devices/models/output/device-view.model';

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase
  implements ICommandHandler<LogoutUserCommand, DeviceViewModel | null>
{
  constructor(private readonly devicesService: DevicesService) {}

  execute(command: LogoutUserCommand): Promise<DeviceViewModel | null> {
    return this.devicesService.removeDevice(command.userId, command.deviceId);
  }
}
