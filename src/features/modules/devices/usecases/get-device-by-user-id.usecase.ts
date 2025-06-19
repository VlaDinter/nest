import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { DeviceViewModel } from '../../users/models/output/device-view.model';
import { GetDeviceByUserIdCommand } from './commands/get-device-by-user-id.command';

@CommandHandler(GetDeviceByUserIdCommand)
export class GetDeviceByUserIdUseCase
  implements ICommandHandler<GetDeviceByUserIdCommand, DeviceViewModel | null>
{
  constructor(private readonly usersService: UsersService) {}

  execute(command: GetDeviceByUserIdCommand): Promise<DeviceViewModel | null> {
    return this.usersService.getDevice(command.deviceId);
  }
}
