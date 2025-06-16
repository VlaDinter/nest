import { registerAs } from '@nestjs/config';

export const getBlogsConfiguration = registerAs('blogs', () => ({
  nameMaxLength: Number(process.env.NAME_MAX_LENGTH),
  websiteUrlMaxLength: Number(process.env.WEBSITE_URL_MAX_LENGTH),
  descriptionMaxLength: Number(process.env.DESCRIPTION_MAX_LENGTH),
}));
