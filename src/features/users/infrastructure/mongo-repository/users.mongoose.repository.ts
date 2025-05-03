import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../entities/user.schema';
import { UserViewModel } from '../../view-models/user-view-model';
import { UserDto } from '../../dto/user.dto';
import { IUsersRepository } from '../../interfaces/users.repository.interface';
import { MeViewModel } from '../../view-models/me-view-model';
import { IFilters } from '../../../../interfaces/filters.interface';
import { IPagination } from '../../../../interfaces/pagination.interface';

@Injectable()
export class UsersMongooseRepository extends IUsersRepository {
  constructor(
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {
    super();
  }

  findUsers(filters: IFilters): Promise<IPagination<UserViewModel>> {
    return this.UserModel.filterUsers(this.UserModel, filters);
  }

  findUser(userId: string): Promise<UserViewModel | null> {
    return this.UserModel.findOne({ id: userId }, { _id: 0, __v: 0 }).lean();
  }

  findUserByLoginOrEmail(loginOrEmail: string): Promise<UserViewModel | null> {
    return this.UserModel.findOne(
      { $or: [{ email: loginOrEmail }, { login: loginOrEmail }] },
      { _id: 0, __v: 0 },
    ).lean();
  }

  findUserByCode(code: string): Promise<UserViewModel | null> {
    return this.UserModel.findOne(
      { 'emailConfirmation.confirmationCode': code },
      { _id: 0, __v: 0 },
    ).lean();
  }

  async findMe(userId: string): Promise<MeViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    return userInstance?.mapDBUserToMeViewModel() || null;
  }

  async createUser(
    createUserDto: UserDto,
    isConfirmed = false,
  ): Promise<UserViewModel> {
    const userInstance = await this.UserModel.setUser(
      this.UserModel,
      createUserDto,
      isConfirmed,
    );

    await userInstance.save();

    return userInstance.mapDBUserToUserViewModel();
  }

  async updateUserEmailConfirmation(
    userId: string,
    isConfirmed = false,
  ): Promise<UserViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    userInstance.emailConfirmation =
      this.UserModel.configureEmailConfirmation(isConfirmed);

    await userInstance.save();

    return userInstance;
  }

  async updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<UserViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId }).exec();

    if (!userInstance) return null;

    userInstance.passwordHash =
      await this.UserModel.generatePasswordHash(newPassword);

    await userInstance.save();

    return userInstance;
  }

  async deleteUser(userId: string): Promise<UserViewModel | null> {
    const userInstance = await this.UserModel.findOne({ id: userId });

    if (!userInstance) return null;

    await userInstance.deleteOne();

    return userInstance;
  }

  async deleteAll(): Promise<void> {
    await this.UserModel.deleteMany();
  }
}
