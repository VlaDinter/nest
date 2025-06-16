export class SendRecoveryCodeEvent {
  constructor(
    public readonly email: string,
    public readonly confirmationCode: string,
  ) {}
}
