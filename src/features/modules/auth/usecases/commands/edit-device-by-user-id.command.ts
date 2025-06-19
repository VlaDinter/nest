import { DeviceDto } from '../../../users/dto/device.dto';

export class EditDeviceByUserIdCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
    public readonly updateDeviceDto: DeviceDto,
  ) {}
}
