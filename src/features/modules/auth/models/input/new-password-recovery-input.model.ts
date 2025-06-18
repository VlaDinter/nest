import { Length } from 'class-validator';
import { passwordConstraints } from '../../../users/constants/constants';
import { IsRequired } from '../../../../common/decorators/validation/is-required.decorator';

export class NewPasswordRecoveryInputModel {
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @IsRequired()
  newPassword: string;
  @IsRequired()
  recoveryCode: string;
}
