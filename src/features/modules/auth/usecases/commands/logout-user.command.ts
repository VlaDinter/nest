export class LogoutUserCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}
