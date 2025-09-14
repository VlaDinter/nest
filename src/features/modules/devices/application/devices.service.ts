import { Inject, Injectable } from '@nestjs/common';
import { DeviceDto } from '../dto/device.dto';
import { DeviceViewModel } from '../models/output/device-view.model';
import { DevicesRepository } from '../infrastructure/devices.repository';

@Injectable()
export class DevicesService {
  constructor(
    @Inject('DevicesRepository')
    private readonly devicesRepository: DevicesRepository,
  ) {}

  getDevices(userId: string): Promise<Array<DeviceViewModel>> {
    return this.devicesRepository.findDevices(userId);
  }

  getDevice(deviceId: string): Promise<DeviceViewModel | null> {
    return this.devicesRepository.findDevice(deviceId);
  }

  addDevice(
    userId: string,
    createDeviceDto: DeviceDto,
  ): Promise<DeviceViewModel> {
    return this.devicesRepository.createDevice(userId, createDeviceDto);
  }

  editDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    return this.devicesRepository.updateDevice(userId, deviceId);
  }

  removeDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    return this.devicesRepository.deleteDevice(userId, deviceId);
  }

  removeDevices(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    return this.devicesRepository.deleteDevices(userId, deviceId);
  }

  async removeAll(): Promise<void> {
    await this.devicesRepository.deleteAll();
  }
}
