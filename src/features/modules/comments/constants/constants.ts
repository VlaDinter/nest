import { getCommentsConfiguration } from '../configuration/comments.configuration';

export const commentConstraints = {
  minLength: getCommentsConfiguration().commentMinLength,
  maxLength: getCommentsConfiguration().commentMaxLength,
};
