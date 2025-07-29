import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { MailNotifications } from '../../../base/adapters/mail-notifications';
import { SendConfirmationToCreatedUserCommand } from './commands/send-confirmation-to-created-user.command';

@CommandHandler(SendConfirmationToCreatedUserCommand)
export class SendConfirmationToCreatedUserUseCase
  implements ICommandHandler<SendConfirmationToCreatedUserCommand, void>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly usersService: UsersService,
    private readonly mailNotifications: MailNotifications,
  ) {}

  async execute(command: SendConfirmationToCreatedUserCommand): Promise<void> {
    const user = await this.usersService.getUser(command.userId);

    if (user?.emailConfirmation?.confirmationCode) {
      await this.mailNotifications.sendRecoveryCode(
        user.email,
        user.emailConfirmation.confirmationCode,
      );
    }
  }
}
