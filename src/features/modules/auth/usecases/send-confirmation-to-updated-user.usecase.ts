import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { UserViewModel } from '../../users/models/output/user-view.model';
import { MailNotifications } from '../../../base/adapters/mail-notifications';
import { SendConfirmationToUpdatedUserCommand } from './commands/send-confirmation-to-updated-user.command';

@CommandHandler(SendConfirmationToUpdatedUserCommand)
export class SendConfirmationToUpdatedUserUseCase
  implements
    ICommandHandler<SendConfirmationToUpdatedUserCommand, UserViewModel | null>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly usersService: UsersService,
    private readonly mailNotifications: MailNotifications,
  ) {}

  async execute(
    command: SendConfirmationToUpdatedUserCommand,
  ): Promise<UserViewModel | null> {
    const user = await this.usersService.getUserByLoginOrEmail(command.email);

    if (!user || user.emailConfirmation?.isConfirmed) {
      return null;
    }

    const updatedUser = await this.usersService.editUserEmailConfirmation(
      user.id,
      false,
    );

    if (updatedUser?.emailConfirmation?.confirmationCode) {
      await this.mailNotifications.sendRecoveryCode(
        updatedUser.email,
        updatedUser.emailConfirmation.confirmationCode,
      );
    }

    return updatedUser;
  }
}
