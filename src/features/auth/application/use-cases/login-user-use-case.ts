import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { LoginSuccessViewModel } from '../../view-models/login-success-view-model';
import { jwtConstants } from '../../../../constants';

export class LoginUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(private readonly jwtService: JwtService) {}

  async execute(command: LoginUserCommand): Promise<LoginSuccessViewModel> {
    const payload = { userId: command.userId };
    const options = { secret: jwtConstants.secret, expiresIn: '24h' };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, options),
    };
  }
}
