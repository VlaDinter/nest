import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/application/users.service';
import { IPayload } from '../../../interfaces/payload.interface';
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

  async validate(payload: IPayload): Promise<IPayload> {
    if (typeof payload?.userId === 'string') {
      const user = await this.usersService.getUser(payload.userId);

      if (user?.emailConfirmation?.isConfirmed) {
        return { userId: payload.userId };
      }
    }

    throw new UnauthorizedException();
  }
}
