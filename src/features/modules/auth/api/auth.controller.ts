import {
  Req,
  Res,
  Get,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { MeViewModel } from '../../users/models/output/me-view.model';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { UserViewModel } from '../../users/models/output/user-view.model';
import { LoginUserCommand } from '../usecases/commands/login-user.command';
import { UserInputModel } from '../../users/models/input/user-input.model';
import { JwtAuthGuard } from '../../../common/guards/bearer/jwt-auth.guard';
import { MeInterceptor } from '../../../common/interceptors/me.interceptor';
import { LogoutUserCommand } from '../usecases/commands/logout-user.command';
import { DeviceViewModel } from '../../users/models/output/device-view.model';
import { LocalAuthGuard } from '../../../common/guards/local/local-auth.guard';
import { LoginSuccessViewModel } from '../models/output/login-success-view.model';
import { RefreshAuthGuard } from '../../../common/guards/bearer/refresh-auth.guard';
import { DeviceInterceptor } from '../../../common/interceptors/device.interceptor';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { BadFieldsException } from '../../../common/exceptions/bad-fields.exception';
import { GetMeByUserIdCommand } from '../usecases/commands/get-me-by-user-id.command';
import { EmailConfirmationInputModel } from '../models/input/email-confirmation-input.model';
import { EditDeviceByUserIdCommand } from '../usecases/commands/edit-device-by-user-id.command';
import { NewPasswordRecoveryInputModel } from '../models/input/new-password-recovery-input.model';
import { SendRecoveryCodeToUserCommand } from '../usecases/commands/send-recovery-code-to-user.command';
import { EditUserPasswordByCodeCommand } from '../usecases/commands/edit-user-password-by-code.command';
import { RegistrationConfirmationCodeInputModel } from '../models/input/registration-confirmation-code-input.model';
import { SendConfirmationToCreatedUserCommand } from '../usecases/commands/send-confirmation-to-created-user.command';
import { SendConfirmationToUpdatedUserCommand } from '../usecases/commands/send-confirmation-to-updated-user.command';
import { EditUserEmailConfirmationByCodeCommand } from '../usecases/commands/edit-user-email-confirmation-by-code.command';
import { AddUserWithValidateOrRejectModelCommand } from '../../users/usecases/commands/add-user-with-validate-or-reject-model.command';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Api('Get info about current user', false, false, true)
  @ApiResponse({
    type: MeViewModel,
    status: HttpStatus.OK,
    description: 'The found record',
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MeInterceptor)
  @Get('/me')
  getMe(@CurrentUserId() currentUserId: string): Promise<UserViewModel | null> {
    const command = new GetMeByUserIdCommand(currentUserId);

    return this.commandBus.execute<GetMeByUserIdCommand, UserViewModel | null>(
      command,
    );
  }

  @Api('Post login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOrEmail: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @UseInterceptors(DeviceInterceptor)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async postLogin(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginSuccessViewModel> {
    const command = new LoginUserCommand(
      req.user?.['userId'],
      req.user?.['deviceId'],
    );

    const result = await this.commandBus.execute<
      LoginUserCommand,
      LoginSuccessViewModel
    >(command);

    res.cookie('refreshToken', result.refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Api('Post refresh token')
  @UseGuards(RefreshAuthGuard)
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  async postRefreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginSuccessViewModel> {
    const device = {
      ip: req.ip!,
      title: req.headers['user-agent']!,
      lastActiveDate: new Date().toISOString(),
    };

    const command = new EditDeviceByUserIdCommand(
      req.user?.['userId'],
      req.user?.['deviceId'],
      device,
    );

    const updatedDevice = await this.commandBus.execute<
      EditDeviceByUserIdCommand,
      DeviceViewModel
    >(command);

    const loginCommand = new LoginUserCommand(
      req.user?.['userId'],
      updatedDevice.deviceId,
    );

    const result = await this.commandBus.execute<
      LoginUserCommand,
      LoginSuccessViewModel
    >(loginCommand);

    res.cookie('refreshToken', result.refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Api('Post registration')
  @UseGuards(ThrottlerGuard)
  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postRegistration(@Body() inputModel: UserInputModel): Promise<void> {
    const createdUser = await this.commandBus.execute(
      new AddUserWithValidateOrRejectModelCommand(inputModel, false),
    );

    await this.commandBus.execute(
      new SendConfirmationToCreatedUserCommand(createdUser.id),
    );
  }

  @Api('Post registration email resending')
  @UseGuards(ThrottlerGuard)
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postRegistrationEmailResending(
    @Body() inputModel: EmailConfirmationInputModel,
  ): Promise<void> {
    const foundUser = await this.commandBus.execute(
      new SendConfirmationToUpdatedUserCommand(inputModel.email),
    );

    if (!foundUser) {
      throw new BadFieldsException([
        {
          field: 'email',
          message: 'email has incorrect value',
        },
      ]);
    }
  }

  @Api('Post registration confirmation')
  @UseGuards(ThrottlerGuard)
  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postRegistrationConfirmation(
    @Body() inputModel: RegistrationConfirmationCodeInputModel,
  ): Promise<void> {
    const command = new EditUserEmailConfirmationByCodeCommand(inputModel.code);
    const foundUser = await this.commandBus.execute<
      EditUserEmailConfirmationByCodeCommand,
      UserViewModel | null
    >(command);

    if (!foundUser) {
      throw new BadFieldsException([
        {
          field: 'code',
          message:
            'confirmation code is incorrect, expired or already been applied',
        },
      ]);
    }
  }

  @Api('Post password recovery')
  @UseGuards(ThrottlerGuard)
  @Post('/password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postPasswordRecovery(
    @Body() inputModel: EmailConfirmationInputModel,
  ): Promise<void> {
    const foundUser = await this.commandBus.execute(
      new SendRecoveryCodeToUserCommand(inputModel.email),
    );

    if (!foundUser) {
      throw new BadFieldsException([
        {
          field: 'email',
          message: 'email has incorrect value',
        },
      ]);
    }
  }

  @Api('Post new password')
  @UseGuards(ThrottlerGuard)
  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postNewPassword(
    @Body() inputModel: NewPasswordRecoveryInputModel,
  ): Promise<void> {
    const command = new EditUserPasswordByCodeCommand(
      inputModel.newPassword,
      inputModel.recoveryCode,
    );

    const updatedUser = await this.commandBus.execute<
      EditUserPasswordByCodeCommand,
      UserViewModel | null
    >(command);

    if (!updatedUser) {
      throw new BadFieldsException([
        {
          field: 'recoveryCode',
          message: 'recovery code is incorrect or expired',
        },
      ]);
    }
  }

  @Api('Post logout')
  @UseGuards(RefreshAuthGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postLogout(@Req() req: Request): Promise<void> {
    const command = new LogoutUserCommand(
      req.user?.['userId'],
      req.user?.['deviceId'],
    );

    await this.commandBus.execute<LogoutUserCommand, DeviceViewModel | null>(
      command,
    );
  }
}
