import { NestFactory } from '@nestjs/core';
import { CoreConfig } from '@core/core.config';
import { appSettings } from '@src/settings/app.settings';
import { initAppModule } from '@src/init/app-module.init';
import { Logger } from '@src/features/base/adapters/logger';

async function bootstrap() {
  const logger = new Logger();
  const appModule = await initAppModule();
  const app = await NestFactory.create(appModule, {
    bufferLogs: true,
  });

  const coreConfig = app.get<CoreConfig>(CoreConfig);

  appSettings(app, appModule);

  await app.listen(coreConfig.port, async () => {
    logger.port(await app.getUrl());
  });
}

bootstrap();
