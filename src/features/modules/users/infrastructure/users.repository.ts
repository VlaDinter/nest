import { UserDto } from '../dto/user.dto';
import { UserViewModel } from '../models/output/user-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

export abstract class UsersRepository {
  abstract findUsers(
    params: IPaginationParams,
  ): Promise<IPagination<UserViewModel>>;
  abstract findUser(userId: string): Promise<UserViewModel | null>;
  abstract findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserViewModel | null>;
  abstract findUserByCode(code: string): Promise<UserViewModel | null>;
  abstract createUser(
    createUserDto: UserDto,
    isConfirmed: boolean,
  ): Promise<UserViewModel>;
  abstract updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<UserViewModel | null>;
  abstract updateUserEmailConfirmation(
    userId: string,
    isConfirmed: boolean,
  ): Promise<UserViewModel | null>;
  abstract deleteUser(userId: string): Promise<UserViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
