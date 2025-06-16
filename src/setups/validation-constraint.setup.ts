import { useContainer } from 'class-validator';
import { DynamicModule, INestApplication } from '@nestjs/common';

export const validationConstraintSetup = (
  app: INestApplication,
  appModule: DynamicModule,
): void => {
  useContainer(app.select(appModule), { fallbackOnErrors: true });
};
