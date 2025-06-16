export class RemoveDeviceByUserIdCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}
