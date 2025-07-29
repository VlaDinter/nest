import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { UserViewModel } from '../../users/models/output/user-view.model';
import { SendRecoveryCodeEvent } from '../handlers/events/send-recovery-code.event';
import { SendRecoveryCodeToUserCommand } from './commands/send-recovery-code-to-user.command';

@CommandHandler(SendRecoveryCodeToUserCommand)
export class SendRecoveryCodeToUserUseCase
  implements
    ICommandHandler<SendRecoveryCodeToUserCommand, UserViewModel | null>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly usersService: UsersService,
  ) {}

  async execute(
    command: SendRecoveryCodeToUserCommand,
  ): Promise<UserViewModel | null> {
    const user = await this.usersService.getUserByLoginOrEmail(command.email);

    if (!user?.emailConfirmation?.isConfirmed) {
      return null;
    }

    const updatedUser = await this.usersService.editUserEmailConfirmation(
      user.id,
      true,
    );

    if (updatedUser?.emailConfirmation?.confirmationCode) {
      await this.eventBus.publish(
        new SendRecoveryCodeEvent(
          updatedUser.email,
          updatedUser.emailConfirmation.confirmationCode,
        ),
      );
    }

    return updatedUser;
  }
}
