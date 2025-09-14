import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserDto } from '../dto/user.dto';
import { Add } from '../../../base/utils/date/add.utils';
import { loginConstraints } from '../constants/constants';
import { UserViewModel } from '../models/output/user-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';
import { EmailConfirmationViewModel } from '../models/output/email-confirmation-view.model';

@Schema({
  _id: false,
})
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

@Schema({ timestamps: true })
export class User {
  createdAt: string;

  @Prop({
    unique: true,
    type: String,
    default(): Types.ObjectId {
      return new Types.ObjectId();
    },
  })
  id: string;

  @Prop({
    unique: true,
    type: String,
    required: true,
    ...loginConstraints,
  })
  login: string;

  @Prop({
    unique: true,
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
    type: EmailConfirmationSchema,
    default: null,
    nullable: true,
  })
  emailConfirmation: EmailConfirmation | null;

  mapToViewModel(): UserViewModel {
    return {
      id: this.id,
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
    };
  }

  static configureEmailConfirmation(
    isConfirmed: boolean,
    expirationDateHours: number,
    expirationDateMinutes: number,
  ): EmailConfirmationViewModel {
    return {
      isConfirmed,
      confirmationCode: randomUUID(),
      expirationDate: Add.hours(
        Add.minutes(new Date(), expirationDateMinutes),
        expirationDateHours,
      ),
    };
  }

  static async generatePasswordHash(
    password: string,
    rounds: number,
  ): Promise<string> {
    const salt = await bcrypt.genSalt(rounds);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }

  static async setUser(
    dto: UserDto,
    isConfirmed: boolean,
    rounds: number,
    expirationDateHours: number,
    expirationDateMinutes: number,
  ): Promise<UserDocument> {
    const createdUser = new this();

    createdUser.login = dto.login;
    createdUser.email = dto.email;
    createdUser.passwordHash = await this.generatePasswordHash(
      dto.password,
      rounds,
    );

    createdUser.emailConfirmation = this.configureEmailConfirmation(
      isConfirmed,
      expirationDateHours,
      expirationDateMinutes,
    );

    return createdUser as UserDocument;
  }

  static async paginated(
    params: IPaginationParams,
  ): Promise<IPagination<UserViewModel>> {
    const UserModel = this as UserModelType;
    const skip = (params.pageNumber - 1) * params.pageSize;
    const sort = { [params.sortBy]: params.sortDirection };
    const query = UserModel.find();

    if (params.searchLoginTerm && params.searchEmailTerm) {
      query.or([
        { login: { $regex: params.searchLoginTerm, $options: 'i' } },
        { email: { $regex: params.searchEmailTerm, $options: 'i' } },
      ]);
    } else if (params.searchLoginTerm) {
      query.where('login').regex(new RegExp(params.searchLoginTerm, 'i'));
    } else if (params.searchEmailTerm) {
      query.where('email').regex(new RegExp(params.searchEmailTerm, 'i'));
    }

    const totalCount = await UserModel.countDocuments(query.getFilter()).lean();
    const result = await query
      .sort(sort)
      .skip(skip)
      .limit(params.pageSize)
      .exec();

    const pagesCount = Math.ceil(totalCount / params.pageSize);

    return {
      totalCount,
      pagesCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      items: result.map(
        (user: UserDocument): UserViewModel => user.mapToViewModel(),
      ),
    };
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
