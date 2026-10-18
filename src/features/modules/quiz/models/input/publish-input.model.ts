import { IsBoolean, IsDefined } from 'class-validator';

export class PublishInputModel {
  @IsBoolean()
  @IsDefined()
  published: boolean;
}
