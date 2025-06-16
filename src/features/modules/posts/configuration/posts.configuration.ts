import { registerAs } from '@nestjs/config';

export const getPostsConfiguration = registerAs('posts', () => ({
  titleMaxLength: Number(process.env.TITLE_MAX_LENGTH),
  contentMaxLength: Number(process.env.CONTENT_MAX_LENGTH),
  shortDescriptionMaxLength: Number(process.env.SHORT_DESCRIPTION_MAX_LENGTH),
}));

export type PostsConfigurationType = {
  posts: ReturnType<typeof getPostsConfiguration>;
};

export type PostsConfigType = PostsConfigurationType & {
  NEWEST_LIKES_LENGTH: number;
};
