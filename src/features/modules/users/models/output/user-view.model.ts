import { EmailConfirmationViewModel } from '@modules/users/models/output/email-confirmation-view.model';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  passwordHash?: string;
  emailConfirmation?: EmailConfirmationViewModel;
}
