import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, MaxLength } from 'class-validator';
import { IsRequired } from '../../../../common/decorators/validation/is-required.decorator';
import {
  nameConstraints,
  websiteUrlConstraints,
  descriptionConstraints,
} from '../../constants/constants';

export class BlogInputModel {
  @MaxLength(nameConstraints.maxLength)
  @IsRequired()
  name: string;
  @MaxLength(descriptionConstraints.maxLength)
  @IsRequired()
  description: string;
  @ApiProperty({
    example: 'https://exemple.com',
  })
  @IsUrl()
  @MaxLength(websiteUrlConstraints.maxLength)
  @IsRequired()
  websiteUrl: string;
}
