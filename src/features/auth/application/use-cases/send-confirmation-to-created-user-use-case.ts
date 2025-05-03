import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailManager } from '../../../../adapters/mail-manager';
import { UsersService } from '../../../users/application/users.service';

export class SendConfirmationToCreatedUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(SendConfirmationToCreatedUserCommand)
export class SendConfirmationToCreatedUserUseCase
  implements ICommandHandler<SendConfirmationToCreatedUserCommand>
{
  constructor(
    private readonly mailManager: MailManager,
    private readonly usersService: UsersService,
  ) {}

  async execute(command: SendConfirmationToCreatedUserCommand): Promise<void> {
    const user = await this.usersService.getUser(command.userId);

    if (user?.emailConfirmation?.confirmationCode) {
      await this.mailManager.sendConfirmation(
        user.email,
        user.emailConfirmation.confirmationCode,
      );
    }
  }
}
