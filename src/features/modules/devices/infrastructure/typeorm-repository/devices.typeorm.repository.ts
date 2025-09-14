import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceDto } from '../../dto/device.dto';
import { Device } from '../../entities/device.entity';
import { DevicesRepository } from '../devices.repository';
import { DeviceViewModel } from '../../models/output/device-view.model';

@Injectable()
export class DevicesTypeormRepository extends DevicesRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {
    super();
  }

  findDevices(userId: string): Promise<DeviceViewModel[]> {
    return this.deviceRepository
      .createQueryBuilder('device')
      .select([
        'device.ip',
        'device.title',
        'device.deviceId',
        'device.lastActiveDate',
      ])
      .where('device.userId = :userId', { userId })
      .getMany();
  }

  findDevice(deviceId: string): Promise<DeviceViewModel | null> {
    return this.deviceRepository
      .createQueryBuilder('device')
      .select([
        'device.ip',
        'device.title',
        'device.deviceId',
        'device.lastActiveDate',
      ])
      .where('device.deviceId = :deviceId', { deviceId })
      .getOne();
  }

  async createDevice(userId: string, dto: DeviceDto): Promise<DeviceViewModel> {
    const device = new Device();

    device.ip = dto.ip;
    device.userId = userId;
    device.title = dto.title;
    device.lastActiveDate = dto.lastActiveDate;

    await this.deviceRepository.save(device);

    return {
      ip: device.ip,
      title: device.title,
      deviceId: device.deviceId,
      lastActiveDate: device.lastActiveDate,
    };
  }

  async updateDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const lastActiveDate = new Date().toISOString();

    await this.deviceRepository.update(
      { userId, deviceId },
      { lastActiveDate },
    );

    return this.deviceRepository.findOne({
      where: { userId, deviceId },
      select: {
        ip: true,
        title: true,
        deviceId: true,
        lastActiveDate: true,
      },
    });
  }

  async deleteDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const device = await this.deviceRepository.findOne({
      where: { userId, deviceId },
      select: {
        ip: true,
        title: true,
        deviceId: true,
        lastActiveDate: true,
      },
    });

    if (!device) {
      return null;
    }

    await this.deviceRepository.remove(device);

    return device;
  }

  async deleteDevices(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const devices = await this.deviceRepository.find({
      where: { userId },
      select: {
        ip: true,
        title: true,
        deviceId: true,
        lastActiveDate: true,
      },
    });

    const device = devices.find(
      (device: DeviceViewModel) => device.deviceId === deviceId,
    );

    if (!device) {
      return null;
    }

    await this.deviceRepository.remove(
      devices.filter((device: DeviceViewModel) => device.deviceId !== deviceId),
    );

    return device;
  }

  async deleteAll(): Promise<void> {
    const devices = await this.deviceRepository.find();

    await this.deviceRepository.remove(devices);
  }
}
