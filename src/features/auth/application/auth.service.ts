import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { UserViewModel } from '../../users/view-models/user-view-model';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class LoginInputModelType {
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  loginOrEmail: string;
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  password: string;
}

export class EmailConfirmationInputModelType {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  email: string;
}

export class RegistrationConfirmationCodeInputModelType {
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  code: string;
}

export class NewPasswordRecoveryInputModelType {
  @Length(6, 20)
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  newPassword: string;
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  recoveryCode: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async getUserByCode(code: string): Promise<UserViewModel | null> {
    const user = await this.usersService.getUserByCode(code);

    if (
      !user?.emailConfirmation ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      return null;
    }

    await this.usersService.editUserEmailConfirmation(user.id, true);

    return user;
  }

  async editUserPassword(
    newPassword: string,
    recoveryCode: string,
  ): Promise<UserViewModel | null> {
    const user = await this.usersService.getUserByCode(recoveryCode);

    if (
      !user?.emailConfirmation?.isConfirmed ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      return null;
    }

    await this.usersService.editUserPassword(user.id, newPassword);

    return user;
  }

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserViewModel | null> {
    const user = await this.usersService.getUserByLoginOrEmail(username);

    if (!user?.passwordHash) {
      return null;
    }

    const isEqual = await bcrypt.compare(pass, user.passwordHash);

    if (!isEqual) {
      return null;
    }

    return user;
  }
}
