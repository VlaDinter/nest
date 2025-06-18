import { getBlogsConfiguration } from '../configuration/blogs.configuration';

export const nameConstraints = {
  maxLength: getBlogsConfiguration().nameMaxLength,
};

export const websiteUrlConstraints = {
  maxLength: getBlogsConfiguration().websiteUrlMaxLength,
};

export const descriptionConstraints = {
  maxLength: getBlogsConfiguration().descriptionMaxLength,
};
