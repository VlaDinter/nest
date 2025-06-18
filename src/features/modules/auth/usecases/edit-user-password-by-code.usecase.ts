import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { UserViewModel } from '../../users/models/output/user-view.model';
import { EditUserPasswordByCodeCommand } from './commands/edit-user-password-by-code.command';

@CommandHandler(EditUserPasswordByCodeCommand)
export class EditUserPasswordByCodeUseCase
  implements
    ICommandHandler<EditUserPasswordByCodeCommand, UserViewModel | null>
{
  constructor(private readonly usersService: UsersService) {}

  async execute(
    command: EditUserPasswordByCodeCommand,
  ): Promise<UserViewModel | null> {
    const user = await this.usersService.getUserByCode(command.code);

    if (
      !user?.emailConfirmation?.isConfirmed ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      return null;
    }

    await this.usersService.editUserPassword(user.id, command.newPassword);

    return user;
  }
}
