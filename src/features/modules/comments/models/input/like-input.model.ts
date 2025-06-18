import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ILikeStatus } from '../../../../base/interfaces/like-status.interface';
import { IsRequired } from '../../../../common/decorators/validation/is-required.decorator';

export class LikeInputModel {
  @ApiProperty({
    example: 'None, Like, Dislike',
  })
  @IsEnum(ILikeStatus)
  @IsRequired()
  likeStatus: ILikeStatus;
}
