import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ErrorExceptionFilter, HttpExceptionFilter } from './exception.filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { FieldErrorInterface } from './interfaces/field-error.interface';

export const appInit = (app: INestApplication) => {
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: errors => {
        const errorsForResp: FieldErrorInterface[] = [];

        errors.forEach(error => {
          const keys = Object.keys(error.constraints || {});

          keys.forEach(key => {
            errorsForResp.push({
              message: error.constraints?.[key],
              field: error.property
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
