import cookieParser from 'cookie-parser';
import { DynamicModule, INestApplication } from '@nestjs/common';
import { pipesSetup } from '../setups/pipes.setup';
import { swaggerSetup } from '../setups/swagger.setup';
import { Logger } from '../features/base/adapters/logger';
import { globalPrefixSetup } from '../setups/global-prefix.setup';
import { exceptionFilterSetup } from '../setups/exception-filter.setup';
import { validationConstraintSetup } from '../setups/validation-constraint.setup';

export const appSettings = (
  app: INestApplication,
  appModule: DynamicModule,
): void => {
  app.enableCors();
  app.use(cookieParser());
  app.useLogger(new Logger());
  globalPrefixSetup(app);
  validationConstraintSetup(app, appModule);
  pipesSetup(app);
  exceptionFilterSetup(app);
  swaggerSetup(app);
};
