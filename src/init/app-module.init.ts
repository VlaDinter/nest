import { NestFactory } from '@nestjs/core';
import { DynamicModule } from '@nestjs/common';
import { AppModule } from '../app.module';
import { CoreConfig } from '../core/core.config';

export async function initAppModule(): Promise<DynamicModule> {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);

  await appContext.close();

  return AppModule.forRoot(coreConfig);
}
