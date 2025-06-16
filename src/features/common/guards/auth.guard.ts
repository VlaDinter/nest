import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Logger } from '@src/features/base/adapters/logger';
import { UsersService } from '@modules/users/application/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    this.logger.setContext('AuthGuard');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        const result = this.jwtService.verify(token);

        if (result?.userId) {
          const user = await this.usersService.getUser(result.userId);

          if (user?.emailConfirmation?.isConfirmed) {
            request.user = { userId: user.id };
          }
        }
      } catch (error) {
        this.logger.debug(error);
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.split(' ')[1];
  }
}
