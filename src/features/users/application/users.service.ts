import { Injectable } from '@nestjs/common';
import { UserViewModel } from '../view-models/user-view-model';
import { UserDto } from '../dto/user.dto';
import { UsersMongooseRepository } from '../infrastructure/mongo-repository/users.mongoose.repository';
import { IsEmail, Length, IsDefined, IsNotEmpty, IsString, validateOrReject, Matches } from 'class-validator';
import { MeViewModel } from '../view-models/me-view-model';
import { PaginationInterface } from '../../../interfaces/pagination.interface';
import { FiltersInterface } from '../../../interfaces/filters.interface';

export class CreateUserInputModelType {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  email: string;
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message: 'Incorrect Login'
  })
  @Length(3, 10)
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  login: string;
  @Length(6, 20)
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  password: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersMongooseRepository) {}

  getUsers(filters: FiltersInterface): Promise<PaginationInterface<UserViewModel>> {
    return this.usersRepository.findUsers(filters);
  }

  getUser(userId: string): Promise<UserViewModel | null> {
    return this.usersRepository.findUser(userId);
  }

  getUserByLoginOrEmail(loginOrEmail: string): Promise<UserViewModel | null> {
    return this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
  }

  getUserByCode(code: string): Promise<UserViewModel | null> {
    return this.usersRepository.findUserByCode(code);
  }

  getMe(userId: string): Promise<MeViewModel | null> {
    return this.usersRepository.findMe(userId);
  }

  async addUser(createUserDto: UserDto, isConfirmed = false): Promise<UserViewModel> {
    await this.validateOrRejectModel(createUserDto, CreateUserInputModelType);

    return this.usersRepository.createUser(createUserDto, isConfirmed);
  }

  editUserEmailConfirmation(
    userId: string,
    isConfirmed = false
  ): Promise<UserViewModel | null> {
    return this.usersRepository.updateUserEmailConfirmation(userId, isConfirmed);
  }

  editUserPassword(
    userId: string,
    newPassword: string
  ): Promise<UserViewModel | null> {
    return this.usersRepository.updateUserPassword(userId, newPassword);
  }

  removeUser(userId: string): Promise<UserViewModel | null> {
    return this.usersRepository.deleteUser(userId);
  }

  async removeAll(): Promise<void> {
    await this.usersRepository.deleteAll();
  }

  async validateOrRejectModel(model: UserDto, ctor: { new (): CreateUserInputModelType }): Promise<void> {
    let user = await this.getUserByLoginOrEmail(model.email);

    if (!user) {
      user = await this.getUserByLoginOrEmail(model.login);
    }

    if (model instanceof ctor === false || user) {
      throw new Error('Incorrect input data');
    }

    try {
      await validateOrReject(model);
    } catch (error) {
      throw new Error(error);
    }
  }
}
