import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceDto } from '../../dto/device.dto';
import { DevicesRepository } from '../devices.repository';
import { DeviceModelType, Device } from '../../schemes/device.schema';
import { DeviceViewModel } from '../../models/output/device-view.model';

@Injectable()
export class DevicesMongooseRepository extends DevicesRepository {
  constructor(
    @InjectModel(Device.name) private readonly DeviceModel: DeviceModelType,
  ) {
    super();
  }

  findDevices(userId: string): Promise<Array<DeviceViewModel>> {
    return this.DeviceModel.find(
      { id: userId },
      { _id: 0, __v: 0, userId: 0 },
    ).exec();
  }

  async findDevice(deviceId: string): Promise<DeviceViewModel | null> {
    const deviceInstance = await this.DeviceModel.findOne({ deviceId }).exec();

    if (!deviceInstance) {
      return deviceInstance;
    }

    return deviceInstance.mapToViewModel();
  }

  async createDevice(
    userId: string,
    createDeviceDto: DeviceDto,
  ): Promise<DeviceViewModel> {
    const deviceInstance = await this.DeviceModel.setDevice(
      createDeviceDto,
      userId,
    );

    await deviceInstance.save();

    return deviceInstance.mapToViewModel();
  }

  async updateDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const deviceInstance = await this.DeviceModel.findOne({
      userId,
      deviceId,
    }).exec();

    if (!deviceInstance) return null;

    deviceInstance.lastActiveDate = new Date().toISOString();

    await deviceInstance.save();

    return deviceInstance.mapToViewModel();
  }

  async deleteDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const deviceInstance = await this.DeviceModel.findOne({
      userId,
      deviceId,
    }).exec();

    if (!deviceInstance) return null;

    await deviceInstance.deleteOne();

    return deviceInstance.mapToViewModel();
  }

  async deleteDevices(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const deviceInstance = await this.DeviceModel.findOne({
      userId,
      deviceId,
    }).exec();

    if (!deviceInstance) return null;

    await this.DeviceModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });

    return deviceInstance.mapToViewModel();
  }

  async deleteAll(): Promise<void> {
    await this.DeviceModel.deleteMany();
  }
}
