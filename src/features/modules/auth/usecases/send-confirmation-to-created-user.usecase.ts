import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { SendConfirmationEvent } from '../handlers/events/send-confirmation.event';
import { SendConfirmationToCreatedUserCommand } from './commands/send-confirmation-to-created-user.command';

@CommandHandler(SendConfirmationToCreatedUserCommand)
export class SendConfirmationToCreatedUserUseCase
  implements ICommandHandler<SendConfirmationToCreatedUserCommand, void>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly usersService: UsersService,
  ) {}

  async execute(command: SendConfirmationToCreatedUserCommand): Promise<void> {
    const user = await this.usersService.getUser(command.userId);

    if (user?.emailConfirmation?.confirmationCode) {
      await this.eventBus.publish(
        new SendConfirmationEvent(
          user.email,
          user.emailConfirmation.confirmationCode,
        ),
      );
    }
  }
}
