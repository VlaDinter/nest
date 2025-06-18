import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { BaseConfig } from '../config/base.config';
import { ConfigType } from '../configuration/configuration';
import { IEnvironments } from '../features/base/interfaces/environments.interface';

@Injectable()
export class CoreConfig extends BaseConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number;

  @IsNotEmpty({
    message: 'Set Env variable SA_LOGIN, example: sa',
  })
  login: string;

  @IsEnum(IEnvironments, {
    message:
      'Set correct NODE_ENV value, available values: ' +
      BaseConfig.getEnumValues(IEnvironments).join(', '),
  })
  env: string;

  @IsNotEmpty({
    message:
      'Set Env variable MONGO_URI, example: mongodb://localhost:27017/myapp_dev',
  })
  mongoURI: string;

  @IsNotEmpty({
    message:
      'Set Env variable EMAIL_FROM, example: Dimych <dimychdeveloper@gmail.com>',
  })
  emailFrom: string;

  @IsNotEmpty({
    message: 'Set Env variable SA_PASSWORD, example: 123',
  })
  password: string;

  @IsNumber(
    {},
    {
      message: 'Set Env variable THROTTLE_TTL, example: 10000',
    },
  )
  throttleTTL: number;

  @IsNotEmpty({
    message: 'Set Env variable MONGO_DB_NAME, example: db',
  })
  mongoDBName: string;

  @IsNumber(
    {},
    {
      message: 'Set Env variable THROTTLE_LIMIT, example: 5',
    },
  )
  throttleLimit: number;

  @IsNotEmpty({
    message: 'Set Env variable EMAIL_FROM_USER, example: user@gmail.com',
  })
  emailFromUser: string;

  @IsNotEmpty({
    message: 'Set Env variable EMAIL_FROM_SERVICE, example: gmail',
  })
  emailFromService: string;

  @IsNotEmpty({
    message: 'Set Env variable EMAIL_FROM_PASSWORD, example: pass',
  })
  emailFromPassword: string;

  @IsBoolean({
    message:
      'Set Env variable IS_SWAGGER_ENABLED to enable/disable Swagger, example: true, available values: true, false',
  })
  isSwaggerEnabled: boolean;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE to enable/disable Dangerous for production TestingModule, example: true, available values: true, false, 0, 1',
  })
  includeTestingModule: boolean;

  @IsNotEmpty({
    message:
      'Set Env variable JWT_ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  jwtAccessTokenSecret: string;

  @IsNotEmpty({
    message:
      'Set Env variable JWT_REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  jwtRefreshTokenSecret: string;

  @IsNotEmpty({
    message:
      'Set Env variable JWT_ACCESS_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  jwtAccessTokenExpiresIn: string;

  @IsNotEmpty({
    message:
      'Set Env variable JWT_REFRESH_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  jwtRefreshTokenExpiresIn: string;

  isDevelopment(): boolean {
    return this.env === IEnvironments.DEVELOPMENT;
  }

  constructor(private configService: ConfigService<ConfigType, true>) {
    super();

    this.port = this.getNumber(
      'PORT',
      this.configService.get('PORT', { infer: true }),
      3000,
    );

    this.login = this.configService.get('SA_LOGIN', { infer: true });
    this.env =
      this.configService.get('NODE_ENV', { infer: true }) ??
      IEnvironments.PRODUCTION;

    this.mongoURI = this.configService.get('MONGO_URI', { infer: true });
    this.emailFrom =
      this.configService.get('EMAIL_FROM', { infer: true }) ??
      'Dimych <dimychdeveloper@gmail.com>';

    this.password = this.configService.get('SA_PASSWORD', { infer: true });
    this.throttleTTL = this.getNumber(
      'THROTTLE_TTL',
      this.configService.get('THROTTLE_TTL', { infer: true }),
      10000,
    );

    this.mongoDBName =
      this.configService.get('MONGO_DB_NAME', {
        infer: true,
      }) ?? 'db';

    this.throttleLimit = this.getNumber(
      'THROTTLE_LIMIT',
      this.configService.get('THROTTLE_LIMIT', { infer: true }),
      5,
    );

    this.emailFromUser = this.configService.get('EMAIL_FROM_USER', {
      infer: true,
    });

    this.emailFromService =
      this.configService.get('EMAIL_FROM_SERVICE', {
        infer: true,
      }) ?? 'gmail';

    this.emailFromPassword = this.configService.get('EMAIL_FROM_PASSWORD', {
      infer: true,
    });

    this.isSwaggerEnabled =
      this.convertToBoolean(
        this.configService.get('IS_SWAGGER_ENABLED', { infer: true }),
      ) ?? true;

    this.includeTestingModule =
      this.convertToBoolean(
        this.configService.get('INCLUDE_TESTING_MODULE', { infer: true }),
      ) ?? true;

    this.jwtAccessTokenSecret = this.configService.get(
      'JWT_ACCESS_TOKEN_SECRET',
      { infer: true },
    );

    this.jwtRefreshTokenSecret = this.configService.get(
      'JWT_REFRESH_TOKEN_SECRET',
      { infer: true },
    );

    this.jwtAccessTokenExpiresIn =
      this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true }) ??
      '10s';

    this.jwtRefreshTokenExpiresIn =
      this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN', { infer: true }) ??
      '20s';

    this.validateConfig(this);
  }
}
