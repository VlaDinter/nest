import bcrypt from 'bcrypt';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users/application/users.service';
import { UserViewModel } from '../../users/models/output/user-view.model';
import { ValidateUserByLoginOrEmailPayload } from './payloads/validate-user-by-login-or-email.payload';

@QueryHandler(ValidateUserByLoginOrEmailPayload)
export class ValidateUserByLoginOrEmailQuery
  implements
    IQueryHandler<ValidateUserByLoginOrEmailPayload, UserViewModel | null>
{
  constructor(private readonly usersService: UsersService) {}

  async execute(
    payload: ValidateUserByLoginOrEmailPayload,
  ): Promise<UserViewModel | null> {
    const user = await this.usersService.getUserByLoginOrEmail(
      payload.loginOrEmail,
    );

    if (!user?.passwordHash) {
      return null;
    }

    const isEqual = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isEqual) {
      return null;
    }

    return user;
  }
}
