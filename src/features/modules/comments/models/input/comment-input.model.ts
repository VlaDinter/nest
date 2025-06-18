import { Length } from 'class-validator';
import { commentConstraints } from '../../constants/constants';
import { IsRequired } from '../../../../common/decorators/validation/is-required.decorator';

export class CommentInputModel {
  @Length(commentConstraints.minLength, commentConstraints.maxLength)
  @IsRequired()
  content: string;
}
