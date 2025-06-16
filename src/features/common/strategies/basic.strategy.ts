import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CoreConfig } from '@core/core.config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly coreConfig: CoreConfig) {
    super();
  }

  async validate(username: string, password: string): Promise<boolean> {
    if (
      this.coreConfig.login === username &&
      this.coreConfig.password === password
    ) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
