import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
  ValidationError,
} from '@nestjs/common';
import { ErrorExceptionFilter, HttpExceptionFilter } from './exception.filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { IFieldError } from './interfaces/field-error.interface';

export const appSettings = (app: INestApplication): void => {
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]): void => {
        const errorsForResp: IFieldError[] = [];

        errors.forEach((error: ValidationError): void => {
          const keys = Object.keys(error.constraints || {});

          keys.forEach((key: string): void => {
            errorsForResp.push({
              message: error.constraints?.[key],
              field: error.property,
            });
          });
        });

        throw new BadRequestException(errorsForResp);
      },
    }),
  );

  app.enableCors();
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
};
