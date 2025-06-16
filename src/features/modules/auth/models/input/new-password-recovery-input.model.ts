import { Length } from 'class-validator';
import { passwordConstraints } from '@modules/users/constants/constants';
import { IsRequired } from '@src/features/common/decorators/validation/is-required.decorator';

export class NewPasswordRecoveryInputModel {
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @IsRequired()
  newPassword: string;
  @IsRequired()
  recoveryCode: string;
}
