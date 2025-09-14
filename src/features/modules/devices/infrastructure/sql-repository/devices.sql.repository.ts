import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DeviceDto } from '../../dto/device.dto';
import { DevicesRepository } from '../devices.repository';
import { DeviceViewModel } from '../../models/output/device-view.model';

@Injectable()
export class DevicesSQLRepository extends DevicesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async findDevices(userId: string): Promise<Array<DeviceViewModel>> {
    const result = await this.dataSource.query(
      `SELECT device_id AS "deviceId", ip, title, last_active_date AS "lastActiveDate" 
       FROM public."Devices" 
       WHERE user_id = $1`,
      [userId],
    );

    return result;
  }

  async findDevice(deviceId: string): Promise<DeviceViewModel | null> {
    const result = await this.dataSource.query(
      `SELECT device_id AS "deviceId", ip, title, last_active_date AS "lastActiveDate" 
       FROM public."Devices" 
       WHERE device_id = $1`,
      [deviceId],
    );

    return result[0] ?? null;
  }

  async createDevice(
    userId: string,
    createDeviceDto: DeviceDto,
  ): Promise<DeviceViewModel> {
    const result = await this.dataSource.query(
      `INSERT INTO public."Devices" 
       (user_id, ip, title, last_active_date)
       VALUES ($1, $2, $3, $4)
       RETURNING device_id AS "deviceId", ip, title, last_active_date AS "lastActiveDate"`,
      [
        userId,
        createDeviceDto.ip,
        createDeviceDto.title,
        createDeviceDto.lastActiveDate,
      ],
    );

    return result[0];
  }

  async updateDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const lastActiveDate = new Date().toISOString();
    const result = await this.dataSource.query(
      `UPDATE public."Devices"
       SET last_active_date = $3
       WHERE user_id = $1 AND device_id = $2
       RETURNING device_id AS "deviceId", ip, title, last_active_date AS "lastActiveDate"`,
      [userId, deviceId, lastActiveDate],
    );

    return result[0][0] ?? null;
  }

  async deleteDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const result = await this.dataSource.query(
      `DELETE FROM public."Devices"
       WHERE user_id = $1 AND device_id = $2
       RETURNING device_id AS "deviceId", ip, title, last_active_date AS "lastActiveDate"`,
      [userId, deviceId],
    );

    return result[0][0] ?? null;
  }

  async deleteDevices(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const result = await this.dataSource.query(
      `SELECT device_id AS "deviceId", ip, title, last_active_date AS "lastActiveDate" 
       FROM public."Devices" 
       WHERE device_id = $1`,
      [deviceId],
    );

    if (!result.length) {
      return null;
    }

    await this.dataSource.query(
      `DELETE FROM public."Devices"
       WHERE user_id = $1 AND device_id != $2`,
      [userId, deviceId],
    );

    return result[0];
  }

  async deleteAll(): Promise<void> {
    await this.dataSource.query('DELETE FROM public."Devices"');
  }
}
