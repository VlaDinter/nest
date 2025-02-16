import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  UnauthorizedException,
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import {
  AuthService,
  EmailConfirmationInputModelType,
  LoginInputModelType,
  NewPasswordRecoveryInputModelType,
  RegistrationConfirmationCodeInputModelType
} from '../application/auth.service';
import { LoginSuccessViewModel } from '../view-models/login-success-view-model';
import { MeViewModel } from '../../users/view-models/me-view-model';
import { CreateUserInputModelType } from '../../users/application/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../../../current-user-id.param.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getMe(
    @CurrentUserId() currentUserId,
  ): Promise<MeViewModel | null> {
    return this.authService.getMe(currentUserId);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async postLogin(@Body() inputModel: LoginInputModelType): Promise<LoginSuccessViewModel> {
    const foundUser = await this.authService.validateUser(inputModel.loginOrEmail, inputModel.password);

    if (!foundUser) {
      throw new UnauthorizedException();
    }

    return this.authService.login(foundUser);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postRegistration(@Body() inputModel: CreateUserInputModelType): Promise<void> {
    await this.authService.addUser(inputModel);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postRegistrationEmailResending(@Body() inputModel: EmailConfirmationInputModelType): Promise<void> {
    await this.authService.editUserEmailConfirmation(inputModel.email);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postRegistrationConfirmation(@Body() inputModel: RegistrationConfirmationCodeInputModelType): Promise<void> {
    const foundUser = await this.authService.getUserByCode(inputModel.code);

    if (!foundUser) {
      throw new BadRequestException();
    }
  }

  @UseGuards(ThrottlerGuard)
  @Post('/password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postPasswordRecovery(@Body() inputModel: EmailConfirmationInputModelType): Promise<void> {
    await this.authService.editUserPasswordRecovery(inputModel.email);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postNewPassword(@Body() inputModel: NewPasswordRecoveryInputModelType): Promise<void> {
    const updatedUser = await this.authService.editUserPassword(inputModel.newPassword, inputModel.recoveryCode);

    if (!updatedUser) {
      throw new BadRequestException();
    }
  }
}
