import { EmailConfirmationViewModel } from './email-confirmation-view.model';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  passwordHash?: string;
  emailConfirmation?: EmailConfirmationViewModel;
}
