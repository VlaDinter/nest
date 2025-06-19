import { UserDto } from '../dto/user.dto';
import { DeviceDto } from '../dto/device.dto';
import { UserViewModel } from '../models/output/user-view.model';
import { DeviceViewModel } from '../models/output/device-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

export abstract class UsersRepository {
  abstract findUsers(
    params: IPaginationParams,
  ): Promise<IPagination<UserViewModel>>;
  abstract findDevices(userId: string): Promise<Array<DeviceViewModel> | null>;
  abstract findUser(userId: string): Promise<UserViewModel | null>;
  abstract findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserViewModel | null>;
  abstract findUserByCode(code: string): Promise<UserViewModel | null>;
  abstract findDevice(deviceId: string): Promise<DeviceViewModel | null>;
  abstract createUser(
    createUserDto: UserDto,
    isConfirmed: boolean,
  ): Promise<UserViewModel>;
  abstract createDevice(
    userId: string,
    createDeviceDto: DeviceDto,
  ): Promise<DeviceViewModel | null>;
  abstract updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<UserViewModel | null>;
  abstract updateUserEmailConfirmation(
    userId: string,
    isConfirmed: boolean,
  ): Promise<UserViewModel | null>;
  abstract updateDevice(
    userId: string,
    deviceId: string,
    updateDeviceDto: DeviceDto,
  ): Promise<DeviceViewModel | null>;
  abstract deleteUser(userId: string): Promise<UserViewModel | null>;
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
