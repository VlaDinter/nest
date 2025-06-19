export class EditDeviceByUserIdCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}
