import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CoreConfig } from '../../../core/core.config';
import { IPayload } from '../../base/interfaces/payload.interface';
import { UsersService } from '../../modules/users/application/users.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private readonly coreConfig: CoreConfig,
    private readonly usersService: UsersService,
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: coreConfig.jwtRefreshTokenSecret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string => {
          return request.cookies.refreshToken;
        },
      ]),
    });
  }

  async validate(payload: IPayload): Promise<IPayload> {
    if (
      typeof payload?.userId === 'string' &&
      typeof payload?.deviceId === 'string'
    ) {
      const user = await this.usersService.getUser(payload.userId);
      const device = await this.usersService.getDevice(payload.deviceId);

      if (user?.emailConfirmation?.isConfirmed && device) {
        return { userId: payload.userId, deviceId: payload.deviceId };
      }
    }

    throw new UnauthorizedException();
  }
}
