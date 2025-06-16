import cookieParser from 'cookie-parser';
import { DynamicModule, INestApplication } from '@nestjs/common';
import { pipesSetup } from '@src/setups/pipes.setup';
import { swaggerSetup } from '@src/setups/swagger.setup';
import { Logger } from '@src/features/base/adapters/logger';
import { globalPrefixSetup } from '@src/setups/global-prefix.setup';
import { exceptionFilterSetup } from '@src/setups/exception-filter.setup';
import { validationConstraintSetup } from '@src/setups/validation-constraint.setup';

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
