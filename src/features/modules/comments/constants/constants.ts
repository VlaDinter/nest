import { getCommentsConfiguration } from '@modules/comments/configuration/comments.configuration';

export const commentConstraints = {
  minLength: getCommentsConfiguration().commentMinLength,
  maxLength: getCommentsConfiguration().commentMaxLength,
};
