import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDto } from '../../dto/user.dto';
import { UsersRepository } from '../users.repository';
import { UsersConfig } from '../../config/users.config';
import { DeviceDto } from '../../../devices/dto/device.dto';
import { User, UserModelType } from '../../schemes/user.schema';
import { UserViewModel } from '../../models/output/user-view.model';
import { DeviceViewModel } from '../../models/output/device-view.model';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';

@Injectable()
export class UsersMongooseRepository extends UsersRepository {
  constructor(
    private readonly usersConfig: UsersConfig,
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {
    super();
  }

  findUsers(params: IPaginationParams): Promise<IPagination<UserViewModel>> {
    return this.UserModel.paginated(params);
  }

  async findDevices(userId: string): Promise<Array<DeviceViewModel> | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    return userInstance.devices;
  }

  findUser(userId: string): Promise<UserViewModel | null> {
    return this.UserModel.findOne(
      { id: userId },
      { _id: 0, __v: 0, updatedAt: 0 },
    ).lean();
  }

  findUserByLoginOrEmail(loginOrEmail: string): Promise<UserViewModel | null> {
    return this.UserModel.findOne(
      { $or: [{ email: loginOrEmail }, { login: loginOrEmail }] },
      { _id: 0, __v: 0, updatedAt: 0 },
    ).lean();
  }

  findUserByCode(code: string): Promise<UserViewModel | null> {
    return this.UserModel.findOne(
      { 'emailConfirmation.confirmationCode': code },
      { _id: 0, __v: 0, updatedAt: 0 },
    ).lean();
  }

  async findDevice(deviceId: string): Promise<DeviceViewModel | null> {
    const userInstance = await this.UserModel.findOne({
      'devices.deviceId': deviceId,
    }).exec();

    if (!userInstance) return null;

    const foundDevice = userInstance.devices.find(
      (device: DeviceViewModel): boolean => device.deviceId === deviceId,
    );

    if (!foundDevice) return null;

    return foundDevice;
  }

  async createUser(
    createUserDto: UserDto,
    isConfirmed: boolean,
  ): Promise<UserViewModel> {
    const userInstance = await this.UserModel.setUser(
      createUserDto,
      isConfirmed,
      this.usersConfig.saltRounds,
      this.usersConfig.emailConfirmationExpirationDateHours,
      this.usersConfig.emailConfirmationExpirationDateMinutes,
    );

    await userInstance.save();

    return userInstance.mapToViewModel();
  }

  async createDevice(
    userId: string,
    createDeviceDto: DeviceDto,
  ): Promise<DeviceViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    userInstance.devices.push(createDeviceDto as DeviceViewModel);

    await userInstance.save();

    return userInstance.devices[userInstance.devices.length - 1];
  }

  async updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<UserViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    userInstance.passwordHash = await this.UserModel.generatePasswordHash(
      newPassword,
      this.usersConfig.saltRounds,
    );

    await userInstance.save();

    return userInstance.mapToViewModel();
  }

  async updateUserEmailConfirmation(
    userId: string,
    isConfirmed: boolean,
  ): Promise<UserViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    userInstance.emailConfirmation = this.UserModel.configureEmailConfirmation(
      isConfirmed,
      this.usersConfig.emailConfirmationExpirationDateHours,
      this.usersConfig.emailConfirmationExpirationDateMinutes,
    );

    await userInstance.save();

    return userInstance.mapToViewModel();
  }

  async updateDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    const foundDevice = userInstance.devices.find(
      (device: DeviceViewModel): boolean => device.deviceId === deviceId,
    );

    if (!foundDevice) return null;

    foundDevice.lastActiveDate = new Date().toISOString();

    await userInstance.save();

    return foundDevice;
  }

  async deleteUser(userId: string): Promise<UserViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    await userInstance.deleteOne();

    return userInstance.mapToViewModel();
  }

  async deleteDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    const foundDevice = userInstance.devices.find(
      (device: DeviceViewModel): boolean => device.deviceId === deviceId,
    );

    if (!foundDevice) return null;

    userInstance.devices = userInstance.devices.filter(
      (device: DeviceViewModel): boolean => device.deviceId !== deviceId,
    );

    await userInstance.save();

    return foundDevice;
  }

  async deleteDevices(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    const foundDevice = userInstance.devices.find(
      (device: DeviceViewModel): boolean => device.deviceId === deviceId,
    );

    if (!foundDevice) return null;

    userInstance.devices = userInstance.devices.filter(
      (device: DeviceViewModel): boolean => device.deviceId === deviceId,
    );

    await userInstance.save();

    return foundDevice;
  }

  async deleteAll(): Promise<void> {
    await this.UserModel.deleteMany();
  }
}
