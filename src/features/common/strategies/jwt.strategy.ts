import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CoreConfig } from '../../../core/core.config';
import { IPayload } from '../../base/interfaces/payload.interface';
import { UsersService } from '../../modules/users/application/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly coreConfig: CoreConfig,
    private readonly usersService: UsersService,
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: coreConfig.jwtAccessTokenSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
