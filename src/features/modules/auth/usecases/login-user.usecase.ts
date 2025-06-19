import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserCommand } from './commands/login-user.command';
import { LoginSuccessViewModel } from '../models/output/login-success-view.model';

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements ICommandHandler<LoginUserCommand, LoginSuccessViewModel>
{
  constructor(
    @Inject('ACCESS_TOKEN_STRATEGY_INJECT_TOKEN')
    private readonly accessTokenContext: JwtService,
    @Inject('REFRESH_TOKEN_STRATEGY_INJECT_TOKEN')
    private readonly refreshTokenContext: JwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginSuccessViewModel> {
    const accessTokenPayload = { userId: command.userId };
    const refreshTokenPayload = {
      userId: command.userId,
      deviceId: command.deviceId,
      lastActiveDate: command.lastActiveDate,
    };

    return {
      accessToken: this.accessTokenContext.sign(accessTokenPayload),
      refreshToken: this.refreshTokenContext.sign(refreshTokenPayload),
    };
  }
}
