import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { IsDefined, IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { UserViewModel } from '../../users/view-models/user-view-model';
import { LoginSuccessViewModel } from '../view-models/login-success-view-model';
import { MeViewModel } from '../../users/view-models/me-view-model';
import { UserDto } from '../../users/dto/user.dto';
import { EmailServiceMock } from '../../email/application/email.service';

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
  constructor(
    private readonly usersService: UsersService,
    private readonly emailServiceMock: EmailServiceMock,
    private readonly jwtService: JwtService
  ) {}

  getMe(userId: string): Promise<MeViewModel | null> {
    return this.usersService.getMe(userId);
  }

  async addUser(createUserDto: UserDto): Promise<void> {
    const createdUser = await this.usersService.addUser(createUserDto);
    const user = await this.usersService.getUser(createdUser.id);

    if (user?.emailConfirmation) {
      await this.emailServiceMock.sendConfirmation(user.email, user.emailConfirmation.confirmationCode);
    }
  }

  async editUserEmailConfirmation(email: string): Promise<void> {
    const user = await this.usersService.getUserByLoginOrEmail(email);

    if (user) {
      const updatedUser = await this.usersService.editUserEmailConfirmation(user.id);

      if (updatedUser?.emailConfirmation) {
        await this.emailServiceMock.sendConfirmation(updatedUser.email, updatedUser.emailConfirmation.confirmationCode);
      }
    }
  }

  async getUserByCode(code: string): Promise<UserViewModel | null> {
    const user = await this.usersService.getUserByCode(code);

    if (!user?.emailConfirmation || user.emailConfirmation.isConfirmed || user.emailConfirmation.expirationDate < new Date()) {
      return null;
    }

    await this.usersService.editUserEmailConfirmation(user.id, true);

    return user;
  }

  async editUserPasswordRecovery(email: string): Promise<void> {
    const user = await this.usersService.getUserByLoginOrEmail(email);

    if (!user?.emailConfirmation?.isConfirmed) {
      await this.emailServiceMock.sendRecoveryCode(email, '');
    }

    if (user) {
      const updatedUser = await this.usersService.editUserEmailConfirmation(user.id);

      if (updatedUser?.emailConfirmation) {
        await this.emailServiceMock.sendRecoveryCode(updatedUser.email, updatedUser.emailConfirmation.confirmationCode);
      }
    }
  }

  async editUserPassword(newPassword: string, recoveryCode: string): Promise<UserViewModel | null> {
    const user = await this.usersService.getUserByCode(recoveryCode);

    if (!user?.emailConfirmation || user.emailConfirmation.expirationDate < new Date()) {
      return null;
    }

    await this.usersService.editUserPassword(user.id, newPassword);

    return user;
  }

  async validateUser(username: string, pass: string): Promise<UserViewModel | null> {
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

  async login(user: UserViewModel): Promise<LoginSuccessViewModel> {
    const payload = { userId: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
