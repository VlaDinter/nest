import {
  Req,
  Get,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { DeviceViewModel } from '../../users/models/output/device-view.model';
import { RefreshAuthGuard } from '../../../common/guards/bearer/refresh-auth.guard';
import { ObjectIdValidationPipe } from '../../../common/pipes/object-id-validation.pipe';
import { GetDeviceByUserIdCommand } from '../usecases/commands/get-device-by-user-id.command';
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

  @Api('Delete security device', true)
  @Delete(':id')
  @HttpCode(HttpStatus.CREATED)
  async deleteSecurityDevice(
    @Req() req: Request,
    @Param('id', ObjectIdValidationPipe) deviceId: string,
  ): Promise<void> {
    const deviceCommand = new GetDeviceByUserIdCommand(deviceId);
    const foundDevice = await this.commandBus.execute<
      GetDeviceByUserIdCommand,
      DeviceViewModel | null
    >(deviceCommand);

    if (!foundDevice) {
      throw new NotFoundException('Device not found');
    }

    const command = new RemoveDeviceByUserIdCommand(
      req.user?.['userId'],
      deviceId,
    );

    const deletedDevice = await this.commandBus.execute<
      RemoveDeviceByUserIdCommand,
      DeviceViewModel | null
    >(command);

    if (!deletedDevice) {
      throw new ForbiddenException('Device not found');
    }
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
