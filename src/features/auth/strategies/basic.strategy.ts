import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  async validate(username: string, password: string): Promise<boolean> {
    if (
      process.env.SA_LOGIN === username &&
      process.env.PASSWORD === password
    ) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
