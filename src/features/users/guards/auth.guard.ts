import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const authorization = `Basic ${Buffer.from(`${process.env.SA_LOGIN}:${process.env.PASSWORD}`).toString('base64')}`;
    const isAuthorized = request.headers.authorization === authorization;

    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
