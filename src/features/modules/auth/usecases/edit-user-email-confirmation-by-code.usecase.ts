import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { UserViewModel } from '../../users/models/output/user-view.model';
import { EditUserEmailConfirmationByCodeCommand } from './commands/edit-user-email-confirmation-by-code.command';

@CommandHandler(EditUserEmailConfirmationByCodeCommand)
export class EditUserEmailConfirmationByCodeUseCase
  implements
    ICommandHandler<
      EditUserEmailConfirmationByCodeCommand,
      UserViewModel | null
    >
{
  constructor(private readonly usersService: UsersService) {}

  async execute(
    command: EditUserEmailConfirmationByCodeCommand,
  ): Promise<UserViewModel | null> {
    const user = await this.usersService.getUserByCode(command.code);

    if (
      !user?.emailConfirmation ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      return null;
    }

    await this.usersService.editUserEmailConfirmation(user.id, true);

    return user;
  }
}
