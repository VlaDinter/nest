import { validate as isValidUUID } from 'uuid';
import { isValidObjectId, Types } from 'mongoose';
import { Injectable, PipeTransform } from '@nestjs/common';
import { BadFieldsException } from '../exceptions/bad-fields.exception';

@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: Types.ObjectId): Types.ObjectId {
    if (!isValidObjectId(value) && !isValidUUID(value)) {
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
