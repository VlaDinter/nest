import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDto } from '../../dto/user.dto';
import { UserViewModel } from '../../view-models/user-view-model';
import { CreateUserInputModelType, UsersService } from '../users.service';
import { BadRequestException } from '@nestjs/common';
import { validateOrReject } from 'class-validator';

export class AddUserWithValidateOrRejectModelCommand {
  constructor(
    public readonly createUserDto: UserDto,
    public readonly isConfirmed: boolean,
  ) {}
}

@CommandHandler(AddUserWithValidateOrRejectModelCommand)
export class AddUserWithValidateOrRejectModelUseCase
  implements ICommandHandler<AddUserWithValidateOrRejectModelCommand>
{
  constructor(private readonly usersService: UsersService) {}

  async execute(
    command: AddUserWithValidateOrRejectModelCommand,
  ): Promise<UserViewModel> {
    await this.validateOrRejectModel(
      command.createUserDto,
      CreateUserInputModelType,
    );

    return this.usersService.addUser(
      command.createUserDto,
      command.isConfirmed,
    );
  }

  async validateOrRejectModel(
    model: UserDto,
    ctor: { new (): CreateUserInputModelType },
  ): Promise<void> {
    const userByEmail = await this.usersService.getUserByLoginOrEmail(
      model.email,
    );

    if (userByEmail) {
      throw new BadRequestException([
        {
          message: 'email already exists',
          field: 'email',
        },
      ]);
    }

    const userByLogin = await this.usersService.getUserByLoginOrEmail(
      model.login,
    );

    if (userByLogin) {
      throw new BadRequestException([
        {
          message: 'login already exists',
          field: 'login',
        },
      ]);
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
