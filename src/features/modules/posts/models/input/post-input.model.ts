import { IsMongoId, MaxLength } from 'class-validator';
import { IsRequired } from '@src/features/common/decorators/validation/is-required.decorator';
import { BlogIsExit } from '@src/features/common/decorators/validation/blog-is-exist.decorator';
import {
  titleConstraints,
  contentConstraints,
  shortDescriptionConstraints,
} from '@modules/posts/constants/constants';

export class PostInputModel {
  @MaxLength(titleConstraints.maxLength)
  @IsRequired()
  title: string;
  @MaxLength(shortDescriptionConstraints.maxLength)
  @IsRequired()
  shortDescription: string;
  @MaxLength(contentConstraints.maxLength)
  @IsRequired()
  content: string;
  @BlogIsExit()
  @IsMongoId()
  @IsRequired()
  blogId: string;
}
