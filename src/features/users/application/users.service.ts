import { Injectable } from '@nestjs/common';
import { UserViewModel } from '../view-models/user-view-model';
import { UserDto } from '../dto/user.dto';
import { UsersMongooseRepository } from '../infrastructure/mongo-repository/users.mongoose.repository';
import {
  IsEmail,
  Length,
  IsDefined,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { MeViewModel } from '../view-models/me-view-model';
import { IPagination } from '../../../interfaces/pagination.interface';
import { IFilters } from '../../../interfaces/filters.interface';

export class CreateUserInputModelType {
  @IsEmail()
  @Matches(/\S/, {
    message: 'Incorrect Email',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  email: string;
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message: 'Incorrect Login',
  })
  @Length(3, 10)
  @Matches(/\S/, {
    message: 'Incorrect Login',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  login: string;
  @Length(6, 20)
  @Matches(/\S/, {
    message: 'Incorrect Password',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  password: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersMongooseRepository) {}

  getUsers(filters: IFilters): Promise<IPagination<UserViewModel>> {
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

  async addUser(
    createUserDto: UserDto,
    isConfirmed = false,
  ): Promise<UserViewModel> {
    return this.usersRepository.createUser(createUserDto, isConfirmed);
  }

  editUserEmailConfirmation(
    userId: string,
    isConfirmed = false,
  ): Promise<UserViewModel | null> {
    return this.usersRepository.updateUserEmailConfirmation(
      userId,
      isConfirmed,
    );
  }

  editUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<UserViewModel | null> {
    return this.usersRepository.updateUserPassword(userId, newPassword);
  }

  removeUser(userId: string): Promise<UserViewModel | null> {
    return this.usersRepository.deleteUser(userId);
  }

  async removeAll(): Promise<void> {
    await this.usersRepository.deleteAll();
  }
}
