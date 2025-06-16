import { MaxLength } from 'class-validator';
import { IsRequired } from '@src/features/common/decorators/validation/is-required.decorator';
import {
  titleConstraints,
  contentConstraints,
  shortDescriptionConstraints,
} from '@modules/posts/constants/constants';

export class BlogPostInputModel {
  @MaxLength(titleConstraints.maxLength)
  @IsRequired()
  title: string;
  @MaxLength(shortDescriptionConstraints.maxLength)
  @IsRequired()
  shortDescription: string;
  @MaxLength(contentConstraints.maxLength)
  @IsRequired()
  content: string;
}
