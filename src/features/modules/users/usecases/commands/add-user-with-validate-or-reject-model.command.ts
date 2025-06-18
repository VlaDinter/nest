import { UserDto } from '../../dto/user.dto';

export class AddUserWithValidateOrRejectModelCommand {
  constructor(
    public readonly createUserDto: UserDto,
    public readonly isConfirmed: boolean,
  ) {}
}
