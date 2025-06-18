import {
  Req,
  Get,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { DeviceViewModel } from '../../users/models/output/device-view.model';
import { RefreshAuthGuard } from '../../../common/guards/bearer/refresh-auth.guard';
import { GetDevicesByUserIdCommand } from '../usecases/commands/get-devices-by-user-id.command';
import { RemoveDeviceByUserIdCommand } from '../usecases/commands/remove-device-by-user-id.command';
import { RemoveDevicesByUserIdCommand } from '../usecases/commands/remove-devices-by-user-id.command';

@ApiTags('Devices')
@UseGuards(RefreshAuthGuard)
@Controller('security/devices')
export class DevicesController {
  constructor(private readonly commandBus: CommandBus) {}

  @Api('Get security devices')
  @Get()
  @HttpCode(HttpStatus.OK)
  getSecurityDevices(@Req() req: Request): Promise<Array<DeviceViewModel>> {
    const command = new GetDevicesByUserIdCommand(req.user?.['userId']);

    return this.commandBus.execute<
      GetDevicesByUserIdCommand,
      Array<DeviceViewModel>
    >(command);
  }

  @Api('Delete security device')
  @Delete()
  @HttpCode(HttpStatus.CREATED)
  async deleteSecurityDevice(@Req() req: Request): Promise<void> {
    const command = new RemoveDeviceByUserIdCommand(
      req.user?.['userId'],
      req.user?.['deviceId'],
    );

    await this.commandBus.execute<
      RemoveDeviceByUserIdCommand,
      DeviceViewModel | null
    >(command);
  }

  @Api('Delete security devices')
  @Delete()
  @HttpCode(HttpStatus.CREATED)
  async deleteSecurityDevices(@Req() req: Request): Promise<void> {
    const command = new RemoveDevicesByUserIdCommand(
      req.user?.['userId'],
      req.user?.['deviceId'],
    );

    await this.commandBus.execute<
      RemoveDevicesByUserIdCommand,
      DeviceViewModel | null
    >(command);
  }
}
