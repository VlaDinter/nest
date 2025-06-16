import { validateOrReject } from 'class-validator';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDto } from '@modules/users/dto/user.dto';
import { UsersService } from '@modules/users/application/users.service';
import { UserViewModel } from '@modules/users/models/output/user-view.model';
import { UserInputModel } from '@modules/users/models/input/user-input.model';
import { IFieldError } from '@src/features/base/interfaces/field-error.interface';
import { BadFieldsException } from '@src/features/common/exceptions/bad-fields.exception';
import { AddUserWithValidateOrRejectModelCommand } from '@modules/users/usecases/commands/add-user-with-validate-or-reject-model.command';

@CommandHandler(AddUserWithValidateOrRejectModelCommand)
export class AddUserWithValidateOrRejectModelUseCase
  implements
    ICommandHandler<AddUserWithValidateOrRejectModelCommand, UserViewModel>
{
  constructor(private readonly usersService: UsersService) {}

  async execute(
    command: AddUserWithValidateOrRejectModelCommand,
  ): Promise<UserViewModel> {
    await this.validateOrRejectModel(command.createUserDto, UserInputModel);

    return this.usersService.addUser(
      command.createUserDto,
      command.isConfirmed,
    );
  }

  async validateOrRejectModel(
    model: UserDto,
    ctor: { new (): UserInputModel },
  ): Promise<void> {
    const errors: IFieldError[] = [];
    const userByEmail = await this.usersService.getUserByLoginOrEmail(
      model.email,
    );

    const userByLogin = await this.usersService.getUserByLoginOrEmail(
      model.login,
    );

    if (userByEmail) {
      errors.push({
        field: 'email',
        message: 'email already exists',
      });
    }

    if (userByLogin) {
      errors.push({
        field: 'login',
        message: 'login already exists',
      });
    }

    if (errors.length) {
      throw new BadFieldsException(errors);
    }

    if (model instanceof ctor === false) {
      throw new Error('Incorrect input data');
    }

    try {
      await validateOrReject(model);
    } catch (error) {
      throw new Error(error);
    }
  }
}
