import { validate as isValidUUID } from 'uuid';
import { Injectable, PipeTransform } from '@nestjs/common';
import { BadFieldsException } from '../exceptions/bad-fields.exception';

@Injectable()
export class UuidValidationPipe implements PipeTransform {
  transform(value: string): string {
    if (!isValidUUID(value)) {
      throw new BadFieldsException([
        {
          field: 'id',
          message: 'id has incorrect value',
        },
      ]);
    }

    return value;
  }
}
