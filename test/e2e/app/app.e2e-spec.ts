import { Server } from 'http';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { GLOBAL_PREFIX } from '@src/setups/global-prefix.setup';
import { initApp, skipDescribe, skipTests } from '../../helpers/helper';

skipDescribe(skipTests.for('appTest'))('AppController (e2e)', () => {
  let httpServer: Server;
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(httpServer)
      .get(`/${GLOBAL_PREFIX}`)
      .expect(HttpStatus.OK)
      .expect('Hello World! Hello IT-INCUBATOR');
  });
});
