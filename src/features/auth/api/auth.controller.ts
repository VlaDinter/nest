import {
  Request,
  Response,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  AuthService,
  EmailConfirmationInputModelType,
  NewPasswordRecoveryInputModelType,
  RegistrationConfirmationCodeInputModelType,
} from '../application/auth.service';
import { MeViewModel } from '../../users/view-models/me-view-model';
import {
  CreateUserInputModelType,
  UsersService,
} from '../../users/application/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../../../current-user-id.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { SendConfirmationToCreatedUserCommand } from '../application/use-cases/send-confirmation-to-created-user-use-case';
import { SendConfirmationToUpdatedUserCommand } from '../application/use-cases/send-confirmation-to-updated-user-use-case';
import { SendRecoveryCodeToUserCommand } from '../application/use-cases/send-recovery-code-to-user-use-case';
import { LoginUserCommand } from '../application/use-cases/login-user-use-case';
import { AddUserWithValidateOrRejectModelCommand } from '../../users/application/use-cases/add-user-with-validate-or-reject-model-use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getMe(@CurrentUserId() currentUserId: string): Promise<MeViewModel | null> {
    return this.usersService.getMe(currentUserId);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async postLogin(@Request() req, @Response() res): Promise<void> {
    const result = await this.commandBus.execute(
      new LoginUserCommand(req.user?.userId),
    );

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    res.send({
      accessToken: result.accessToken,
    });
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postRegistration(
    @Body() inputModel: CreateUserInputModelType,
  ): Promise<void> {
    const createdUser = await this.commandBus.execute(
      new AddUserWithValidateOrRejectModelCommand(inputModel, false),
    );

    await this.commandBus.execute(
      new SendConfirmationToCreatedUserCommand(createdUser.id),
    );
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postRegistrationEmailResending(
    @Body() inputModel: EmailConfirmationInputModelType,
  ): Promise<void> {
    const foundUser = await this.commandBus.execute(
      new SendConfirmationToUpdatedUserCommand(inputModel.email),
    );

    if (!foundUser) {
      throw new BadRequestException([
        {
          message: 'email has incorrect value',
          field: 'email',
        },
      ]);
    }
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postRegistrationConfirmation(
    @Body() inputModel: RegistrationConfirmationCodeInputModelType,
  ): Promise<void> {
    const foundUser = await this.authService.getUserByCode(inputModel.code);

    if (!foundUser) {
      throw new BadRequestException([
        {
          message:
            'confirmation code is incorrect, expired or already been applied',
          field: 'code',
        },
      ]);
    }
  }

  @UseGuards(ThrottlerGuard)
  @Post('/password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postPasswordRecovery(
    @Body() inputModel: EmailConfirmationInputModelType,
  ): Promise<void> {
    const foundUser = await this.commandBus.execute(
      new SendRecoveryCodeToUserCommand(inputModel.email),
    );

    if (!foundUser) {
      throw new BadRequestException([
        {
          message: 'email has incorrect value',
          field: 'email',
        },
      ]);
    }
  }

  @UseGuards(ThrottlerGuard)
  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postNewPassword(
    @Body() inputModel: NewPasswordRecoveryInputModelType,
  ): Promise<void> {
    const updatedUser = await this.authService.editUserPassword(
      inputModel.newPassword,
      inputModel.recoveryCode,
    );

    if (!updatedUser) {
      throw new BadRequestException([
        {
          message: 'recoveryCode is incorrect or expired',
          field: 'recoveryCode',
        },
      ]);
    }
  }
}
