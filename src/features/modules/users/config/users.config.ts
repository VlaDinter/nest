import { IsNumber } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseConfig } from '@src/config/base.config';
import { UsersConfigType } from '@modules/users/configuration/users.configuration';

@Injectable()
export class UsersConfig extends BaseConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable SALT_ROUNDS, example: 10',
    },
  )
  saltRounds: number;

  @IsNumber(
    {},
    {
      message:
        'Set Env variable EMAIL_CONFIRMATION_EXPIRATION_DATE_HOURS, example: 1',
    },
  )
  emailConfirmationExpirationDateHours: number;

  @IsNumber(
    {},
    {
      message:
        'Set Env variable EMAIL_CONFIRMATION_EXPIRATION_DATE_MINUTES, example: 30',
    },
  )
  emailConfirmationExpirationDateMinutes: number;

  constructor(private configService: ConfigService<UsersConfigType, true>) {
    super();

    this.saltRounds = this.getNumber(
      'SALT_ROUNDS',
      this.configService.get('SALT_ROUNDS', { infer: true }),
      10,
    );

    this.emailConfirmationExpirationDateHours = this.getNumber(
      'EMAIL_CONFIRMATION_EXPIRATION_DATE_HOURS',
      this.configService.get('EMAIL_CONFIRMATION_EXPIRATION_DATE_HOURS', {
        infer: true,
      }),
      1,
    );

    this.emailConfirmationExpirationDateMinutes = this.getNumber(
      'EMAIL_CONFIRMATION_EXPIRATION_DATE_MINUTES',
      this.configService.get('EMAIL_CONFIRMATION_EXPIRATION_DATE_MINUTES', {
        infer: true,
      }),
      30,
    );

    this.validateConfig(this);
  }
}
