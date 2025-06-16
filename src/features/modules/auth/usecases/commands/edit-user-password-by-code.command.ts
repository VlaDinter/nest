export class EditUserPasswordByCodeCommand {
  constructor(
    public readonly code: string,
    public readonly newPassword: string,
  ) {}
}
