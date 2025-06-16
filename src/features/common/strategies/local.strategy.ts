import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@modules/auth/application/auth.service';
import { IPayload } from '@src/features/base/interfaces/payload.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<IPayload> {
    const user = await this.authService.validateUser(loginOrEmail, password);

    if (!user?.emailConfirmation?.isConfirmed) {
      throw new UnauthorizedException();
    }

    return { userId: user.id };
  }
}
