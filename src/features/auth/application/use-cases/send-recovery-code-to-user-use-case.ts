import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailManager } from '../../../../adapters/mail-manager';
import { UsersService } from '../../../users/application/users.service';
import { UserViewModel } from '../../../users/view-models/user-view-model';

export class SendRecoveryCodeToUserCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(SendRecoveryCodeToUserCommand)
export class SendRecoveryCodeToUserUseCase
  implements ICommandHandler<SendRecoveryCodeToUserCommand>
{
  constructor(
    private readonly mailManager: MailManager,
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
    );

    if (updatedUser?.emailConfirmation?.confirmationCode) {
      await this.mailManager.sendRecoveryCode(
        updatedUser.email,
        updatedUser.emailConfirmation.confirmationCode,
      );
    }

    return updatedUser;
  }
}
