import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsRequired } from '@src/features/common/decorators/validation/is-required.decorator';

export class EmailConfirmationInputModel {
  @ApiProperty({
    example: 'email@gmail.com',
  })
  @IsEmail()
  @IsRequired()
  email: string;
}
