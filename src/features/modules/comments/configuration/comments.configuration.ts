import { registerAs } from '@nestjs/config';

export const getCommentsConfiguration = registerAs('comments', () => ({
  commentMinLength: Number(process.env.COMMENT_MIN_LENGTH),
  commentMaxLength: Number(process.env.COMMENT_MAX_LENGTH),
}));
