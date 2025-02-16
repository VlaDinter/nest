import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/application/users.service';
import { PayloadInterface } from '../../../interfaces/payload.interface';
import { jwtConstants } from '../../../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: PayloadInterface): Promise<PayloadInterface> {
    if (typeof payload?.userId !== 'string') {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.getUser(payload.userId);

    if (!user?.emailConfirmation?.isConfirmed) {
      throw new UnauthorizedException();
    }

    return { userId: payload.userId };
  }
}
