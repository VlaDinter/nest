import { Request } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { IFieldError } from '@src/features/base/interfaces/field-error.interface';
import { BadFieldsException } from '@src/features/common/exceptions/bad-fields.exception';

@Injectable()
export class LoginMiddleware implements NestMiddleware {
  use(req: Request, _, next: () => void): void {
    const { loginOrEmail, password } = req.body;
    const errors: IFieldError[] = [];

    if (
      !loginOrEmail ||
      typeof loginOrEmail !== 'string' ||
      !loginOrEmail.trim()
    ) {
      errors.push({
        field: 'loginOrEmail',
        message: 'loginOrEmail has incorrect value',
      });
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      errors.push({
        field: 'password',
        message: 'password has incorrect value',
      });
    }

    if (errors.length) {
      throw new BadFieldsException(errors);
    }

    next();
  }
}
