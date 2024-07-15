import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../entities/user.schema';
import { FiltersType } from '../../../../types/FiltersType';
import { PaginationType } from '../../../../types/PaginationType';
import { UserViewModel } from '../../view-models/user-view-model';
import { UserDto } from '../../dto/user.dto';
import { IUsersRepository } from '../../interfaces/users.repository.interface';

@Injectable()
export class UsersMongooseRepository extends IUsersRepository {
  constructor(
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {
    super();
  }

  findUsers(filters: FiltersType): Promise<PaginationType<UserViewModel>> {
    return this.UserModel.filterUsers(filters, this.UserModel);
  }

  async createUser(createUserDto: UserDto): Promise<UserViewModel> {
    const userInstance = await this.UserModel.setUser(
      createUserDto,
      this.UserModel,
    );

    await userInstance.save();

    return userInstance.mapDBUserToUserViewModel();
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
