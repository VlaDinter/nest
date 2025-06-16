export class ValidateUserByLoginOrEmailPayload {
  constructor(
    public readonly loginOrEmail: string,
    public readonly password: string,
  ) {}
}
