import { registerAs } from '@nestjs/config';

export const getUsersConfiguration = registerAs('users', () => ({
  loginMinLength: Number(process.env.LOGIN_MIN_LENGTH),
  loginMaxLength: Number(process.env.LOGIN_MAX_LENGTH),
  passwordMinLength: Number(process.env.PASSWORD_MIN_LENGTH),
  passwordMaxLength: Number(process.env.PASSWORD_MAX_LENGTH),
}));

export type UsersConfigurationType = {
  users: ReturnType<typeof getUsersConfiguration>;
};

export type UsersConfigType = UsersConfigurationType & {
  SALT_ROUNDS: number;
  EMAIL_CONFIRMATION_EXPIRATION_DATE_HOURS: number;
  EMAIL_CONFIRMATION_EXPIRATION_DATE_MINUTES: number;
};
