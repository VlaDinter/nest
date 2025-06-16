import { UserDto } from '@modules/users/dto/user.dto';

export class AddUserWithValidateOrRejectModelCommand {
  constructor(
    public readonly createUserDto: UserDto,
    public readonly isConfirmed: boolean,
  ) {}
}
