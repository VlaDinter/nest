export class SendConfirmationEvent {
  constructor(
    public readonly email: string,
    public readonly confirmationCode: string,
  ) {}
}
