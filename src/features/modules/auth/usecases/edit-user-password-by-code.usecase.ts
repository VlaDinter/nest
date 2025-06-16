import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '@modules/users/application/users.service';
import { UserViewModel } from '@modules/users/models/output/user-view.model';
import { EditUserPasswordByCodeCommand } from '@modules/auth/usecases/commands/edit-user-password-by-code.command';

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
