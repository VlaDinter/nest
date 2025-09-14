import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDto } from '../../dto/user.dto';
import { UsersRepository } from '../users.repository';
import { UsersConfig } from '../../config/users.config';
import { User, UserModelType } from '../../schemes/user.schema';
import { UserViewModel } from '../../models/output/user-view.model';
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

  async deleteUser(userId: string): Promise<UserViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    await userInstance.deleteOne();

    return userInstance.mapToViewModel();
  }

  async deleteAll(): Promise<void> {
    await this.UserModel.deleteMany();
  }
}
