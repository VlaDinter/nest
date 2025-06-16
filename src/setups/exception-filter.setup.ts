import { INestApplication } from '@nestjs/common';
import {
  HttpExceptionFilter,
  ErrorExceptionFilter,
} from '@src/features/common/filters/exception.filter';

export const exceptionFilterSetup = (app: INestApplication): void => {
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
};
