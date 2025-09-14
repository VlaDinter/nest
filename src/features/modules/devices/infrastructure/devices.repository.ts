import { DeviceDto } from '../dto/device.dto';
import { DeviceViewModel } from '../models/output/device-view.model';

export abstract class DevicesRepository {
  abstract findDevices(userId: string): Promise<Array<DeviceViewModel>>;
  abstract findDevice(deviceId: string): Promise<DeviceViewModel | null>;
  abstract createDevice(
    userId: string,
    createDeviceDto: DeviceDto,
  ): Promise<DeviceViewModel>;
  abstract updateDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null>;
  abstract deleteDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null>;
  abstract deleteDevices(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
