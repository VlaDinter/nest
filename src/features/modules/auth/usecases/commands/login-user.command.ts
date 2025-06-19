export class LoginUserCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
    public readonly lastActiveDate: string,
  ) {}
}
