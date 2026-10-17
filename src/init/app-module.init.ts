import { NestFactory } from '@nestjs/core';
import { DynamicModule, Module } from '@nestjs/common';
import { AppModule } from '../app.module';
import { configModule } from '../config/config';
import { CoreConfig } from '../core/core.config';

@Module({
  imports: [configModule],
  providers: [CoreConfig],
})
class ConfigOnlyModule {}

export async function initAppModule(): Promise<DynamicModule> {
  const appContext =
    await NestFactory.createApplicationContext(ConfigOnlyModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);

  await appContext.close();

  return AppModule.forRoot(coreConfig);
}
