import {
  Req,
  Get,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { DevicesService } from '../application/devices.service';
import { DeviceViewModel } from '../models/output/device-view.model';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { RefreshAuthGuard } from '../../../common/guards/bearer/refresh-auth.guard';
import { ObjectIdValidationPipe } from '../../../common/pipes/object-id-validation.pipe';

@ApiTags('Devices')
@UseGuards(RefreshAuthGuard)
@Controller('security/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Api('Get security devices')
  @Get()
  @HttpCode(HttpStatus.OK)
  getSecurityDevices(@Req() req: Request): Promise<Array<DeviceViewModel>> {
    return this.devicesService.getDevices(req.user?.['userId']);
  }

  @Api('Delete security device', true)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSecurityDevice(
    @Req() req: Request,
    @Param('id', ObjectIdValidationPipe) deviceId: string,
  ): Promise<void> {
    const foundDevice = await this.devicesService.getDevice(deviceId);

    if (!foundDevice) {
      throw new NotFoundException('Device not found');
    }

    const deletedDevice = await this.devicesService.removeDevice(
      req.user?.['userId'],
      deviceId,
    );

    if (!deletedDevice) {
      throw new ForbiddenException('Device not found');
    }
  }

  @Api('Delete security devices')
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSecurityDevices(@Req() req: Request): Promise<void> {
    await this.devicesService.removeDevices(
      req.user?.['userId'],
      req.user?.['deviceId'],
    );
  }
}
