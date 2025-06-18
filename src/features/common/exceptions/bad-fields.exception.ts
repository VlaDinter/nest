import { HttpStatus } from '@nestjs/common';
import { IFieldError } from '../../base/interfaces/field-error.interface';

export class BadFieldsException {
  code: HttpStatus;
  extensions: IFieldError[];

  constructor(errorInfo: IFieldError[]) {
    this.extensions = errorInfo;
    this.code = HttpStatus.BAD_REQUEST;
  }
}
