export class RemoveDevicesByUserIdCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}
