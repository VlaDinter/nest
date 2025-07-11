import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserDto } from '../../dto/user.dto';
import { UsersRepository } from '../users.repository';
import { UsersConfig } from '../../config/users.config';
import { Add } from '../../../../base/utils/date/add.utils';
import { DeviceDto } from '../../../devices/dto/device.dto';
import { UserViewModel } from '../../models/output/user-view.model';
import { DeviceViewModel } from '../../models/output/device-view.model';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';

@Injectable()
export class UsersSQLRepository extends UsersRepository {
  constructor(
    private readonly usersConfig: UsersConfig,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super();
  }

  async findUsers(
    params: IPaginationParams,
  ): Promise<IPagination<UserViewModel>> {
    const sort: string[] = [];
    const skip: string[] = [];
    const values: string[] = [];
    const filters: string[] = [];
    const offset = (params.pageNumber - 1) * params.pageSize;

    if (params.searchLoginTerm) {
      values.push(`%${params.searchLoginTerm}%`);
      filters.push(`login ILIKE $${values.length}`);
    }

    if (params.searchEmailTerm) {
      values.push(`%${params.searchEmailTerm}%`);
      filters.push(`email ILIKE $${values.length}`);
    }

    const where = !filters.length ? '' : `WHERE ${filters.join(' OR ')}`;
    const count = await this.dataSource.query(
      `SELECT COUNT(*) 
       FROM public."Users" 
       ${where}`,
      values,
    );

    const totalCount = Number(count[0].count);
    const pagesCount = Math.ceil(totalCount / params.pageSize);

    sort.push(`"${params.sortBy}"`);
    sort.push(`${params.sortDirection}`);

    const orderBy = `ORDER BY ${sort.join(' ')}`;

    values.push(`${params.pageSize}`);
    skip.push(`LIMIT $${values.length}`);
    values.push(`${offset}`);
    skip.push(`OFFSET $${values.length}`);

    const limit = skip.join(' ');
    const result = await this.dataSource.query(
      `SELECT id, login, email, created_at AS "createdAt"
       FROM public."Users"
       ${where}
       ${orderBy}
       ${limit}`,
      values,
    );

    return {
      pagesCount,
      totalCount,
      items: result,
      page: params.pageNumber,
      pageSize: params.pageSize,
    };
  }

  async findDevices(userId: string): Promise<Array<DeviceViewModel> | null> {
    const result = await this.dataSource.query(
      `SELECT device_id AS "deviceId", ip, title, last_active_date AS "lastActiveDate" 
       FROM public."Devices" 
       WHERE user_id = $1`,
      [userId],
    );

    return result;
  }

  async findUser(userId: string): Promise<UserViewModel | null> {
    const result = await this.dataSource.query(
      `SELECT 
       users.id,
       users.login,
       users.email,
       users.created_at AS "createdAt",
       users.password_hash AS "passwordHash",
       confirmations.id AS "confirmationId",
       confirmations.confirmation_code AS "confirmationCode",
       confirmations.expiration_date AS "expirationDate",
       confirmations.is_confirmed AS "isConfirmed"
       FROM public."Users" users
       LEFT OUTER JOIN public."Confirmations" confirmations
       ON users.id = confirmations.user_id
       WHERE users.id = $1`,
      [userId],
    );

    if (!result.length) {
      return null;
    }

    return {
      id: result[0].id,
      login: result[0].login,
      email: result[0].email,
      createdAt: result[0].createdAt,
      passwordHash: result[0].passwordHash,
      emailConfirmation: !result[0].confirmationId
        ? undefined
        : {
            isConfirmed: result[0].isConfirmed,
            expirationDate: result[0].expirationDate,
            confirmationCode: result[0].confirmationCode,
          },
    };
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserViewModel | null> {
    const result = await this.dataSource.query(
      `SELECT 
       users.id,
       users.login,
       users.email,
       users.created_at AS "createdAt",
       users.password_hash AS "passwordHash",
       confirmations.id AS "confirmationId",
       confirmations.confirmation_code AS "confirmationCode",
       confirmations.expiration_date AS "expirationDate",
       confirmations.is_confirmed AS "isConfirmed"
       FROM public."Users" users
       LEFT OUTER JOIN public."Confirmations" confirmations
       ON users.id = confirmations.user_id
       WHERE email = $1 OR login = $1`,
      [loginOrEmail],
    );

    if (!result.length) {
      return null;
    }

    return {
      id: result[0].id,
      login: result[0].login,
      email: result[0].email,
      createdAt: result[0].createdAt,
      passwordHash: result[0].passwordHash,
      emailConfirmation: !result[0].confirmationId
        ? undefined
        : {
            isConfirmed: result[0].isConfirmed,
            expirationDate: result[0].expirationDate,
            confirmationCode: result[0].confirmationCode,
          },
    };
  }

  async findUserByCode(code: string): Promise<UserViewModel | null> {
    const result = await this.dataSource.query(
      `SELECT 
       users.id,
       users.login,
       users.email,
       users.created_at AS "createdAt",
       users.password_hash AS "passwordHash",
       confirmations.id AS "confirmationId",
       confirmations.confirmation_code AS "confirmationCode",
       confirmations.expiration_date AS "expirationDate",
       confirmations.is_confirmed AS "isConfirmed"
       FROM public."Users" users
       INNER JOIN public."Confirmations" confirmations
       ON users.id = confirmations.user_id
       WHERE confirmations.confirmation_code = $1`,
      [code],
    );

    if (!result.length) {
      return null;
    }

    return {
      id: result[0].id,
      login: result[0].login,
      email: result[0].email,
      createdAt: result[0].createdAt,
      passwordHash: result[0].passwordHash,
      emailConfirmation: !result[0].confirmationId
        ? undefined
        : {
            isConfirmed: result[0].isConfirmed,
            expirationDate: result[0].expirationDate,
            confirmationCode: result[0].confirmationCode,
          },
    };
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

  async createUser(
    createUserDto: UserDto,
    isConfirmed: boolean,
  ): Promise<UserViewModel> {
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      this.usersConfig.saltRounds,
    );

    const result = await this.dataSource.query(
      `INSERT INTO public."Users" 
       (login, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, login, email, created_at AS "createdAt"`,
      [createUserDto.login, createUserDto.email, passwordHash],
    );

    const confirmationCode = randomUUID();
    const expirationDate = Add.hours(
      Add.minutes(
        new Date(),
        this.usersConfig.emailConfirmationExpirationDateMinutes,
      ),
      this.usersConfig.emailConfirmationExpirationDateHours,
    );

    await this.dataSource.query(
      `INSERT INTO public."Confirmations"
       (user_id, confirmation_code, expiration_date, is_confirmed)
       VALUES ($1, $2, $3, $4)`,
      [result[0].id, confirmationCode, expirationDate, isConfirmed],
    );

    return result[0];
  }

  async createDevice(
    userId: string,
    createDeviceDto: DeviceDto,
  ): Promise<DeviceViewModel | null> {
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

  async updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<UserViewModel | null> {
    const passwordHash = await bcrypt.hash(
      newPassword,
      this.usersConfig.saltRounds,
    );

    const result = await this.dataSource.query(
      `UPDATE public."Users"
       SET password_hash = $2
       WHERE id = $1
       RETURNING id, login, email, created_at AS "createdAt"`,
      [userId, passwordHash],
    );

    return result[0][0] ?? null;
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

    await this.dataSource.query(
      `UPDATE public."Confirmations"
       SET confirmation_code = $2,
       expiration_date = $3,
       is_confirmed = $4
       WHERE user_id = $1`,
      [userId, confirmationCode, expirationDate, isConfirmed],
    );

    const result = await this.dataSource.query(
      `SELECT 
       users.id,
       users.login,
       users.email,
       users.created_at AS "createdAt",
       users.password_hash AS "passwordHash",
       confirmations.id AS "confirmationId",
       confirmations.confirmation_code AS "confirmationCode",
       confirmations.expiration_date AS "expirationDate",
       confirmations.is_confirmed AS "isConfirmed"
       FROM public."Users" users
       LEFT OUTER JOIN public."Confirmations" confirmations
       ON users.id = confirmations.user_id
       WHERE users.id = $1`,
      [userId],
    );

    if (!result.length) {
      return null;
    }

    return {
      id: result[0].id,
      login: result[0].login,
      email: result[0].email,
      createdAt: result[0].createdAt,
      passwordHash: result[0].passwordHash,
      emailConfirmation: !result[0].confirmationId
        ? undefined
        : {
            isConfirmed: result[0].isConfirmed,
            expirationDate: result[0].expirationDate,
            confirmationCode: result[0].confirmationCode,
          },
    };
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

  async deleteUser(userId: string): Promise<UserViewModel | null> {
    const result = await this.dataSource.query(
      `DELETE FROM public."Users"
       WHERE id = $1
       RETURNING id, login, email, created_at AS "createdAt"`,
      [userId],
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
      `DELETE FROM public."Devices"
       WHERE user_id = $1 AND device_id != $2`,
      [userId, deviceId],
    );

    return result;
  }

  async deleteAll(): Promise<void> {
    await this.dataSource.query('DELETE FROM public."Users"');
  }
}
