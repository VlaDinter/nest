import { createWriteStream } from 'fs';
import { get, IncomingMessage } from 'http';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CoreConfig } from '@core/core.config';
import { Logger } from '@src/features/base/adapters/logger';

export const swaggerSetup = (app: INestApplication): void => {
  const logger = new Logger();
  const coreConfig = app.get<CoreConfig>(CoreConfig);
  const serverUrl = `http://localhost:${coreConfig.port}`;

  if (coreConfig.isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Examples')
      .setDescription('The nest api description')
      .addBasicAuth(
        {
          type: 'http',
          scheme: 'basic',
        },
        'basicAuth',
      )
      .addBearerAuth()
      .setVersion('1.0')
      .addTag('auth')
      .addTag('users')
      .addTag('blogs')
      .addTag('posts')
      .addTag('comments')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('swagger', app, document, {
      customSiteTitle: 'Swagger',
    });

    if (coreConfig.isDevelopment()) {
      get(
        `${serverUrl}/swagger/swagger-ui-bundle.js`,
        function (response: IncomingMessage): void {
          response.pipe(
            createWriteStream('swagger-static/swagger-ui-bundle.js'),
          );
          logger.verbose(
            `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
          );
        },
      );

      get(
        `${serverUrl}/swagger/swagger-ui-init.js`,
        function (response: IncomingMessage): void {
          response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
          logger.verbose(
            `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`,
          );
        },
      );

      get(
        `${serverUrl}/swagger/swagger-ui-standalone-preset.js`,
        function (response: IncomingMessage): void {
          response.pipe(
            createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
          );
          logger.verbose(
            `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
          );
        },
      );

      get(
        `${serverUrl}/swagger/swagger-ui.css`,
        function (response: IncomingMessage): void {
          response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
          logger.verbose(
            `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
          );
        },
      );
    }
  }
};
