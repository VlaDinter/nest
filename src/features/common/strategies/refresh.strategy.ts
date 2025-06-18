import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
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
      const foundDevice = await this.usersService.getDevice(payload.deviceId);

      if (!foundDevice) {
        throw new NotFoundException('Device not found');
      }

      const updatedDevice = await this.usersService.editDevice(
        payload.userId,
        payload.deviceId,
      );

      if (!updatedDevice) {
        throw new ForbiddenException('Device not found');
      }

      return { userId: payload.userId, deviceId: payload.deviceId };
    }

    throw new UnauthorizedException();
  }
}
