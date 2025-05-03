import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserDto } from '../dto/user.dto';
import { UserViewModel } from '../view-models/user-view-model';
import { MeViewModel } from '../view-models/me-view-model';
import { EmailConfirmationViewModel } from '../view-models/email-confirmation-view-model';
import { IPagination } from '../../../interfaces/pagination.interface';
import { IFilters } from '../../../interfaces/filters.interface';
import { ISortDirections } from '../../../interfaces/sort-directions.interface';

@Schema()
export class EmailConfirmation {
  @Prop({
    type: String,
    required: true,
  })
  confirmationCode: string;

  @Prop({
    type: Date,
    required: true,
  })
  expirationDate: Date;

  @Prop({
    type: Boolean,
    required: true,
  })
  isConfirmed: boolean;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);

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
    required: true,
  })
  passwordHash: string;

  @Prop({
    type: String,
    default(): string {
      return new Date().toISOString();
    },
  })
  createdAt: string;

  @Prop({
    type: EmailConfirmationSchema,
    required: true,
  })
  emailConfirmation: EmailConfirmation;

  mapDBUserToUserViewModel(): UserViewModel {
    return {
      id: this.id,
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
    };
  }

  mapDBUserToMeViewModel(): MeViewModel {
    return {
      userId: this.id,
      login: this.login,
      email: this.email,
    };
  }

  static configureEmailConfirmation(
    isConfirmed = false,
  ): EmailConfirmationViewModel {
    return {
      isConfirmed,
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 30,
      }),
    };
  }

  static async generatePasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }

  static async setUser(
    UserModel: UserModelType,
    dto: UserDto,
    isConfirmed = false,
  ): Promise<UserDocument> {
    const createdUser = new UserModel({
      login: dto.login,
      email: dto.email,
      passwordHash: await UserModel.generatePasswordHash(dto.password),
      emailConfirmation: UserModel.configureEmailConfirmation(isConfirmed),
    });

    return createdUser;
  }

  static async filterUsers(
    UserModel: UserModelType,
    filters: IFilters,
  ): Promise<IPagination<UserViewModel>> {
    const searchLoginTerm = filters.searchLoginTerm;
    const searchEmailTerm = filters.searchEmailTerm;
    const sortBy = filters.sortBy;
    const sortDirection =
      filters.sortDirection === ISortDirections.ASC
        ? ISortDirections.ASC
        : ISortDirections.DESC;
    const pageSize = filters.pageSize > 0 ? filters.pageSize : 10;
    const pageNumber = filters.pageNumber > 0 ? filters.pageNumber : 1;
    const skip = (pageNumber - 1) * pageSize;
    const sort = !sortBy ? {} : { [sortBy]: sortDirection };
    const query = UserModel.find(
      {},
      { _id: 0, __v: 0, passwordHash: 0, emailConfirmation: 0 },
    );

    if (searchLoginTerm && searchEmailTerm) {
      query.or([
        { login: { $regex: searchLoginTerm, $options: 'i' } },
        { email: { $regex: searchEmailTerm, $options: 'i' } },
      ]);
    } else if (searchLoginTerm) {
      query.where('login').regex(new RegExp(searchLoginTerm, 'i'));
    } else if (searchEmailTerm) {
      query.where('email').regex(new RegExp(searchEmailTerm, 'i'));
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
  mapDBUserToMeViewModel: User.prototype.mapDBUserToMeViewModel,
  mapDBUserToUserViewModel: User.prototype.mapDBUserToUserViewModel,
};

type UserModelStaticType = {
  generatePasswordHash: (password: string) => Promise<string>;
  configureEmailConfirmation: (
    isConfirmed?: boolean,
  ) => EmailConfirmationViewModel;
  setUser: (
    UserModel: UserModelType,
    dto: UserDto,
    isConfirmed?: boolean,
  ) => Promise<UserDocument>;
  filterUsers: (
    PostModel: UserModelType,
    filters: IFilters,
  ) => Promise<IPagination<UserViewModel>>;
};

const userStaticMethods: UserModelStaticType = {
  setUser: User.setUser,
  filterUsers: User.filterUsers,
  generatePasswordHash: User.generatePasswordHash,
  configureEmailConfirmation: User.configureEmailConfirmation,
};

UserSchema.statics = userStaticMethods;

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & UserModelStaticType;
