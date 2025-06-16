import { QueryBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UserViewModel } from '@modules/users/models/output/user-view.model';
import { ValidateUserByLoginOrEmailPayload } from '@modules/auth/queries/payloads/validate-user-by-login-or-email.payload';

@Injectable()
export class AuthService {
  constructor(private readonly queryBus: QueryBus) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserViewModel | null> {
    const payload = new ValidateUserByLoginOrEmailPayload(username, pass);

    const result = await this.queryBus.execute<
      ValidateUserByLoginOrEmailPayload,
      UserViewModel | null
    >(payload);

    return result;
  }
}
