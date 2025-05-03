import { UserViewModel } from '../view-models/user-view-model';
import { UserDto } from '../dto/user.dto';
import { IFilters } from '../../../interfaces/filters.interface';
import { IPagination } from '../../../interfaces/pagination.interface';

export abstract class IUsersRepository {
  abstract findUsers(filters: IFilters): Promise<IPagination<UserViewModel>>;
  abstract findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserViewModel | null>;
  abstract createUser(createUserDto: UserDto): Promise<UserViewModel>;
  abstract deleteUser(userId: string): Promise<UserViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
