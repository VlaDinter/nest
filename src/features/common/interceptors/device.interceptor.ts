import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UsersService } from '../../modules/users/application/users.service';
import { LoginSuccessViewModel } from '../../modules/auth/models/output/login-success-view.model';

@Injectable()
export class DeviceInterceptor implements NestInterceptor {
  constructor(private readonly usersService: UsersService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<LoginSuccessViewModel>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    if (request.user && request.ip && request.headers['user-agent']) {
      const device = {
        ip: request.ip,
        title: request.headers['user-agent'],
        lastActiveDate: new Date().toISOString(),
      };

      const createdDevice = await this.usersService.addDevice(
        request.user['userId'],
        device,
      );

      if (createdDevice) {
        request.user['deviceId'] = createdDevice.deviceId;
      }
    }

    return next.handle();
  }
}
