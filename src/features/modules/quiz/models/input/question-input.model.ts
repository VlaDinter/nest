import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { bodyConstraints } from '../../constants/constants';
import { IsRequired } from '../../../../common/decorators/validation/is-required.decorator';

export class QuestionInputModel {
  @Length(bodyConstraints.minLength, bodyConstraints.maxLength)
  @IsRequired()
  body: string;
  @ApiProperty({
    example: ['6', 'six'],
  })
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }: TransformFnParams): unknown =>
    Array.isArray(value)
      ? value.map((item: unknown): unknown =>
          typeof item === 'string' ? item.trim() : item,
        )
      : value,
  )
  correctAnswers: string[];
}
