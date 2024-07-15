import { Injectable } from '@nestjs/common';
import { FiltersType } from '../../../types/FiltersType';
import { PaginationType } from '../../../types/PaginationType';
import { UserViewModel } from '../view-models/user-view-model';
import { UserDto } from '../dto/user.dto';
import { UsersMongooseRepository } from '../infrastructure/mongo-repository/users.mongoose.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersMongooseRepository) {}

  getUsers(filters: FiltersType): Promise<PaginationType<UserViewModel>> {
    return this.usersRepository.findUsers(filters);
  }

  addUser(createUserDto: UserDto): Promise<UserViewModel> {
    return this.usersRepository.createUser(createUserDto);
  }

  removeUser(userId: string): Promise<UserViewModel | null> {
    return this.usersRepository.deleteUser(userId);
  }

  async removeAll(): Promise<void> {
    await this.usersRepository.deleteAll();
  }
}
