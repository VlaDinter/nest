import { get, IncomingMessage } from 'http';
import { createWriteStream } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './settings';

const PORT = process.env.PORT || 7000;
const serverUrl = `http://localhost:${PORT}`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSettings(app);

  const config = new DocumentBuilder()
    .setTitle('Examples')
    .setDescription('The nest API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('blogs')
    .addTag('posts')
    .addTag('comments')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  await app.listen(PORT);

  console.log(`Application is running on: ${await app.getUrl()}`);

  if (process.env.NODE_ENV === 'development') {
    get(
      `${serverUrl}/swagger/swagger-ui-bundle.js`,
      function (response: IncomingMessage): void {
        response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
        console.log(
          `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
        );
      },
    );

    get(
      `${serverUrl}/swagger/swagger-ui-init.js`,
      function (response: IncomingMessage): void {
        response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
        console.log(
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
        console.log(
          `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
        );
      },
    );

    get(
      `${serverUrl}/swagger/swagger-ui.css`,
      function (response: IncomingMessage): void {
        response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
        console.log(
          `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
        );
      },
    );
  }
}

bootstrap();
