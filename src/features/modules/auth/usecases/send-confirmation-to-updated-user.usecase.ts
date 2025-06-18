import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { UserViewModel } from '../../users/models/output/user-view.model';
import { SendConfirmationEvent } from '../handlers/events/send-confirmation.event';
import { SendConfirmationToUpdatedUserCommand } from './commands/send-confirmation-to-updated-user.command';

@CommandHandler(SendConfirmationToUpdatedUserCommand)
export class SendConfirmationToUpdatedUserUseCase
  implements
    ICommandHandler<SendConfirmationToUpdatedUserCommand, UserViewModel | null>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly usersService: UsersService,
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
      this.eventBus.publish(
        new SendConfirmationEvent(
          updatedUser.email,
          updatedUser.emailConfirmation.confirmationCode,
        ),
      );
    }

    return updatedUser;
  }
}
