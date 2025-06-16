import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CoreConfig } from '@core/core.config';
import { UsersService } from '@modules/users/application/users.service';
import { IPayload } from '@src/features/base/interfaces/payload.interface';

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
