import { INestApplication } from '@nestjs/common';

export const GLOBAL_PREFIX = 'api';

export const globalPrefixSetup = (app: INestApplication): void => {
  app.setGlobalPrefix(GLOBAL_PREFIX);
};
