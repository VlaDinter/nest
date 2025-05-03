import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { LoginSuccessViewModel } from '../../view-models/login-success-view-model';

export class LoginUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(private readonly jwtService: JwtService) {}

  async execute(command: LoginUserCommand): Promise<LoginSuccessViewModel> {
    const payload = { userId: command.userId };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
