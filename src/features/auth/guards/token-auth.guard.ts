import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TokenAuthGuard extends AuthGuard('token') {
  handleRequest(err, user) {
    if (err || !user) {
      return null;
    }

    return user;
  }
}
