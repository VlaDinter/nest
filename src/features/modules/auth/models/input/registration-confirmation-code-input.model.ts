import { IsRequired } from '../../../../common/decorators/validation/is-required.decorator';

export class RegistrationConfirmationCodeInputModel {
  @IsRequired()
  code: string;
}
