import { IsRequired } from '@src/features/common/decorators/validation/is-required.decorator';

export class RegistrationConfirmationCodeInputModel {
  @IsRequired()
  code: string;
}
