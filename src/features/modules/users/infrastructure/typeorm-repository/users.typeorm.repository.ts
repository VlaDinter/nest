import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UserDto } from '../../dto/user.dto';
import { User } from '../../entities/user.entity';
import { UsersRepository } from '../users.repository';
import { UsersConfig } from '../../config/users.config';
import { Add } from '../../../../base/utils/date/add.utils';
import { DeviceDto } from '../../../devices/dto/device.dto';
import { Device } from '../../../devices/entities/device.entity';
import { UserViewModel } from '../../models/output/user-view.model';
import { DeviceViewModel } from '../../models/output/device-view.model';
import { EmailConfirmation } from '../../entities/email-confirmation.entity';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';

@Injectable()
export class UsersTypeormRepository extends UsersRepository {
  constructor(
    private readonly usersConfig: UsersConfig,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super();
  }

  async findUsers(
    params: IPaginationParams,
  ): Promise<IPagination<UserViewModel>> {
    const result = this.entityManager.createQueryBuilder().from(User, 'user');

    if (params.searchLoginTerm) {
      result.orWhere('user.login ILIKE :login', {
        login: `%${params.searchLoginTerm}%`,
      });
    }

    if (params.searchEmailTerm) {
      result.orWhere('user.email ILIKE :email', {
        email: `%${params.searchEmailTerm}%`,
      });
    }

    const [items, totalCount] = await result
      .select(['user.id', 'user.login', 'user.email', 'user.createdAt'])
      .orderBy(
        `user.${params.sortBy}`,
        params.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip((params.pageNumber - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount();

    return {
      items,
      totalCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      pagesCount: Math.ceil(totalCount / params.pageSize),
    };
  }

  findDevices(userId: string): Promise<DeviceViewModel[]> {
    return this.entityManager
      .createQueryBuilder()
      .from(Device, 'device')
      .select([
        'device.ip',
        'device.title',
        'device.deviceId',
        'device.lastActiveDate',
      ])
      .where('device.userId = :userId', { userId })
      .getMany();
  }

  findUser(userId: string): Promise<UserViewModel | null> {
    return this.entityManager
      .createQueryBuilder()
      .from(User, 'user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  findUserByLoginOrEmail(loginOrEmail: string): Promise<UserViewModel | null> {
    return this.entityManager
      .createQueryBuilder()
      .from(User, 'user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .where('user.email = :value OR user.login = :value', {
        value: loginOrEmail,
      })
      .getOne();
  }

  findUserByCode(code: string): Promise<UserViewModel | null> {
    return this.entityManager
      .createQueryBuilder()
      .from(User, 'user')
      .innerJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .where('emailConfirmation.confirmationCode = :code', { code })
      .getOne();
  }

  findDevice(deviceId: string): Promise<DeviceViewModel | null> {
    return this.entityManager
      .createQueryBuilder()
      .from(Device, 'device')
      .select([
        'device.ip',
        'device.title',
        'device.deviceId',
        'device.lastActiveDate',
      ])
      .where('device.deviceId = :deviceId', { deviceId })
      .getOne();
  }

  async createUser(
    createUserDto: UserDto,
    isConfirmed: boolean,
  ): Promise<UserViewModel> {
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      this.usersConfig.saltRounds,
    );

    const user = new User();

    user.login = createUserDto.login;
    user.email = createUserDto.email;
    user.passwordHash = passwordHash;

    await this.entityManager.save(user);

    const emailConfirmation = new EmailConfirmation();

    emailConfirmation.id = Date.now();
    emailConfirmation.userId = user.id;
    emailConfirmation.isConfirmed = isConfirmed;
    emailConfirmation.confirmationCode = randomUUID();
    emailConfirmation.expirationDate = Add.hours(
      Add.minutes(
        new Date(),
        this.usersConfig.emailConfirmationExpirationDateMinutes,
      ),
      this.usersConfig.emailConfirmationExpirationDateHours,
    );

    await this.entityManager.save(emailConfirmation);

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async createDevice(
    userId: string,
    dto: DeviceDto,
  ): Promise<DeviceViewModel | null> {
    const device = new Device();

    device.ip = dto.ip;
    device.userId = userId;
    device.title = dto.title;
    device.lastActiveDate = dto.lastActiveDate;

    await this.entityManager.save(device);

    return {
      ip: device.ip,
      title: device.title,
      deviceId: device.deviceId,
      lastActiveDate: device.lastActiveDate,
    };
  }

  async updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<UserViewModel | null> {
    const passwordHash = await bcrypt.hash(
      newPassword,
      this.usersConfig.saltRounds,
    );

    await this.entityManager.update(User, userId, { passwordHash });

    return this.entityManager.findOne<User>(User, {
      where: { id: userId },
      relations: ['emailConfirmation'],
    });
  }

  async updateUserEmailConfirmation(
    userId: string,
    isConfirmed: boolean,
  ): Promise<UserViewModel | null> {
    const confirmationCode = randomUUID();
    const expirationDate = Add.hours(
      Add.minutes(
        new Date(),
        this.usersConfig.emailConfirmationExpirationDateMinutes,
      ),
      this.usersConfig.emailConfirmationExpirationDateHours,
    );

    await this.entityManager.update(
      EmailConfirmation,
      { userId },
      {
        isConfirmed,
        expirationDate,
        confirmationCode,
      },
    );

    return this.entityManager.findOne<User>(User, {
      where: { id: userId },
      relations: ['emailConfirmation'],
    });
  }

  async updateDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const lastActiveDate = new Date().toISOString();

    await this.entityManager.update(
      Device,
      { userId, deviceId },
      { lastActiveDate },
    );

    return this.entityManager.findOne<Device>(Device, {
      where: { userId, deviceId },
      select: {
        ip: true,
        title: true,
        deviceId: true,
        lastActiveDate: true,
      },
    });
  }

  async deleteUser(userId: string): Promise<UserViewModel | null> {
    const user = await this.entityManager.findOne<User>(User, {
      where: { id: userId },
      relations: ['emailConfirmation'],
    });

    if (!user) {
      return null;
    }

    await this.entityManager.remove(user);

    return user;
  }

  async deleteDevice(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const device = await this.entityManager.findOne<Device>(Device, {
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

    await this.entityManager.remove(device);

    return device;
  }

  async deleteDevices(
    userId: string,
    deviceId: string,
  ): Promise<DeviceViewModel | null> {
    const devices = await this.entityManager.find<Device>(Device, {
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

    await this.entityManager.remove(
      devices.filter((device: DeviceViewModel) => device.deviceId !== deviceId),
    );

    return device;
  }

  async deleteAll(): Promise<void> {
    await this.entityManager.clear(User);
  }
}
