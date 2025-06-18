import { getPostsConfiguration } from '../configuration/posts.configuration';

export const titleConstraints = {
  maxLength: getPostsConfiguration().titleMaxLength,
};

export const contentConstraints = {
  maxLength: getPostsConfiguration().contentMaxLength,
};

export const shortDescriptionConstraints = {
  maxLength: getPostsConfiguration().shortDescriptionMaxLength,
};
