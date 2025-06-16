import { applyDecorators } from '@nestjs/common';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '@src/features/common/decorators/transform/trim.decorator';

export const IsRequired = (): PropertyDecorator =>
  applyDecorators(IsDefined(), IsString(), Trim(), IsNotEmpty());
