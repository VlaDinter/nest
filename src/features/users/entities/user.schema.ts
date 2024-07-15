import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, SortOrder, Types } from 'mongoose';
import { FiltersType } from '../../../types/FiltersType';
import { PaginationType } from '../../../types/PaginationType';
import { UserDto } from '../dto/user.dto';
import { UserViewModel } from '../view-models/user-view-model';

@Schema()
export class User {
  @Prop({
    type: String,
    default(): Types.ObjectId {
      return new Types.ObjectId();
    },
  })
  id: string;

  @Prop({
    type: String,
    required: true,
  })
  login: string;

  @Prop({
    type: String,
    required: true,
  })
  email: string;

  @Prop({
    type: String,
    default(): string {
      return new Date().toISOString();
    },
  })
  createdAt: string;

  mapDBUserToUserViewModel(): UserViewModel {
    return {
      id: this.id,
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
    };
  }

  static setUser(dto: UserDto, UserModel: UserModelType): UserDocument {
    const createdUser = new UserModel({
      login: dto.login,
      email: dto.email,
    });

    return createdUser;
  }

  static async filterUsers(
    filters: FiltersType,
    UserModel: UserModelType,
  ): Promise<PaginationType<UserViewModel>> {
    const sortBy =
      typeof filters.sortBy === 'string' ? filters.sortBy : 'createdAt';
    const sortDirection: SortOrder =
      filters.sortDirection === 'asc' ? 'asc' : 'desc';
    const pageNumber = Number.isInteger(Number(filters.pageNumber))
      ? Number(filters.pageNumber)
      : 1;
    const pageSize = Number.isInteger(Number(filters.pageSize))
      ? Number(filters.pageSize)
      : 10;
    const skip = (pageNumber - 1) * pageSize;
    const sort = { [sortBy]: sortDirection };
    const query = UserModel.find({}, { _id: 0, __v: 0 });

    if (
      typeof filters.searchLoginTerm === 'string' &&
      typeof filters.searchEmailTerm === 'string' &&
      filters.searchLoginTerm &&
      filters.searchEmailTerm
    ) {
      query.or([
        { login: { $regex: filters.searchLoginTerm, $options: 'i' } },
        { email: { $regex: filters.searchEmailTerm, $options: 'i' } },
      ]);
    } else if (
      typeof filters.searchLoginTerm === 'string' &&
      filters.searchLoginTerm
    ) {
      query.where('login').regex(new RegExp(filters.searchLoginTerm, 'i'));
    } else if (
      typeof filters.searchEmailTerm === 'string' &&
      filters.searchEmailTerm
    ) {
      query.where('email').regex(new RegExp(filters.searchEmailTerm, 'i'));
    }

    const totalCount = await UserModel.countDocuments(query.getFilter()).lean();
    const result = await query.sort(sort).skip(skip).limit(pageSize).lean();
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pageSize,
      pagesCount,
      totalCount,
      page: pageNumber,
      items: result,
    };
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  mapDBUserToUserViewModel: User.prototype.mapDBUserToUserViewModel,
};

type UserModelStaticType = {
  setUser: (dto: UserDto, UserModel: UserModelType) => UserDocument;
  filterUsers: (
    filters: FiltersType,
    PostModel: UserModelType,
  ) => Promise<PaginationType<UserViewModel>>;
};

const userStaticMethods: UserModelStaticType = {
  setUser: User.setUser,
  filterUsers: User.filterUsers,
};

UserSchema.statics = userStaticMethods;

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & UserModelStaticType;
