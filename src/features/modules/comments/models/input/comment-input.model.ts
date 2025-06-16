import { Length } from 'class-validator';
import { commentConstraints } from '@modules/comments/constants/constants';
import { IsRequired } from '@src/features/common/decorators/validation/is-required.decorator';

export class CommentInputModel {
  @Length(commentConstraints.minLength, commentConstraints.maxLength)
  @IsRequired()
  content: string;
}
