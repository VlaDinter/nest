import {
  ValidationPipe,
  ValidationError,
  INestApplication,
} from '@nestjs/common';
import { IFieldError } from '@src/features/base/interfaces/field-error.interface';
import { BadFieldsException } from '@src/features/common/exceptions/bad-fields.exception';

const errorFormatter = (errors: ValidationError[]): IFieldError[] => {
  const errorsForResp: IFieldError[] = [];

  errors.forEach((error: ValidationError): void => {
    const keys = Object.keys(error.constraints || {});

    keys.forEach((key: string): void => {
      errorsForResp.push({
        field: error.property,
        message: error.constraints?.[key],
      });
    });
  });

  return errorsForResp;
};

export const pipesSetup = (app: INestApplication): void => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]): void => {
        const formattedErrors = errorFormatter(errors);

        throw new BadFieldsException(formattedErrors);
      },
    }),
  );
};
