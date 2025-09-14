import { Inject, Injectable } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { UserViewModel } from '../models/output/user-view.model';
import { UsersRepository } from '../infrastructure/users.repository';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: UsersRepository,
  ) {}

  getUsers(params: IPaginationParams): Promise<IPagination<UserViewModel>> {
    return this.usersRepository.findUsers(params);
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

  addUser(
    createUserDto: UserDto,
    isConfirmed: boolean,
  ): Promise<UserViewModel> {
    return this.usersRepository.createUser(createUserDto, isConfirmed);
  }

  editUserEmailConfirmation(
    userId: string,
    isConfirmed: boolean,
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
