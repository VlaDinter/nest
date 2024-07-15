import { PaginationType } from '../../../types/PaginationType';
import { UserViewModel } from '../view-models/user-view-model';
import { FiltersType } from '../../../types/FiltersType';
import { UserDto } from '../dto/user.dto';

export abstract class IUsersRepository {
  abstract findUsers(
    filters: FiltersType,
  ): Promise<PaginationType<UserViewModel>>;
  abstract createUser(createUserDto: UserDto): Promise<UserViewModel>;
  abstract deleteUser(userId: string): Promise<UserViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
