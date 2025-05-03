import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailManager } from '../../../../adapters/mail-manager';
import { UsersService } from '../../../users/application/users.service';
import { UserViewModel } from '../../../users/view-models/user-view-model';

export class SendConfirmationToUpdatedUserCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(SendConfirmationToUpdatedUserCommand)
export class SendConfirmationToUpdatedUserUseCase
  implements ICommandHandler<SendConfirmationToUpdatedUserCommand>
{
  constructor(
    private readonly mailManager: MailManager,
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
    );

    if (updatedUser?.emailConfirmation?.confirmationCode) {
      await this.mailManager.sendConfirmation(
        updatedUser.email,
        updatedUser.emailConfirmation.confirmationCode,
      );
    }

    return updatedUser;
  }
}
