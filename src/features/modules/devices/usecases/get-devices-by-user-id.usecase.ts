import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { DeviceViewModel } from '../../users/models/output/device-view.model';
import { GetDevicesByUserIdCommand } from './commands/get-devices-by-user-id.command';

@CommandHandler(GetDevicesByUserIdCommand)
export class GetDevicesByUserIdUseCase
  implements
    ICommandHandler<GetDevicesByUserIdCommand, Array<DeviceViewModel> | null>
{
  constructor(private readonly usersService: UsersService) {}

  execute(
    command: GetDevicesByUserIdCommand,
  ): Promise<Array<DeviceViewModel> | null> {
    return this.usersService.getDevices(command.userId);
  }
}
