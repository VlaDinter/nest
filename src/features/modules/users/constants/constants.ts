import { getUsersConfiguration } from '@modules/users/configuration/users.configuration';

export const loginConstraints = {
  match: /^[a-zA-Z0-9_-]*$/,
  minLength: getUsersConfiguration().loginMinLength,
  maxLength: getUsersConfiguration().loginMaxLength,
};

export const passwordConstraints = {
  minLength: getUsersConfiguration().passwordMinLength,
  maxLength: getUsersConfiguration().passwordMaxLength,
};
