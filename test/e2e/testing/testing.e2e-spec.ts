import { Server } from 'http';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { GLOBAL_PREFIX } from '@src/setups/global-prefix.setup';
import { initApp, skipDescribe, skipTests } from '../../helpers/helper';

skipDescribe(skipTests.for('testingTest'))('TestingController', () => {
  let httpServer: Server;
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete all data', async () => {
    await request(httpServer)
      .delete(`/${GLOBAL_PREFIX}/testing/all-data`)
      .expect(HttpStatus.NO_CONTENT);
  });
});
