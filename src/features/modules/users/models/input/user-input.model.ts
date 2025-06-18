import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, Matches } from 'class-validator';
import { IsRequired } from '../../../../common/decorators/validation/is-required.decorator';
import {
  loginConstraints,
  passwordConstraints,
} from '../../constants/constants';

export class UserInputModel {
  @ApiProperty({
    example: 'ww@ww.ww',
  })
  @IsEmail()
  @IsRequired()
  email: string;
  @ApiProperty({
    example: 'dimych',
  })
  @Matches(loginConstraints.match, {
    message: 'incorrect login',
  })
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
  @IsRequired()
  login: string;
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @IsRequired()
  password: string;
}
