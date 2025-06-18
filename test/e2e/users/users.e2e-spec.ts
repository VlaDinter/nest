import { Server } from 'http';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { TestingModuleBuilder } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestManager } from './users.test-manager';
import { CoreConfig } from '../../../src/core/core.config';
import { GLOBAL_PREFIX } from '../../../src/setups/global-prefix.setup';
import { MailNotifications } from '../../../src/features/base/adapters/mail-notifications';
import {
  delay,
  initApp,
  skipTests,
  skipDescribe,
  deleteAllData,
} from '../../helpers/helper';

skipDescribe(skipTests.for('usersTest'))('UsersController', () => {
  let httpServer: Server;
  let app: INestApplication;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    app = await initApp((builder: TestingModuleBuilder) => {
      builder
        .overrideProvider('ACCESS_TOKEN_STRATEGY_INJECT_TOKEN')
        .useFactory({
          inject: [CoreConfig],
          factory: (coreConfig: CoreConfig) => {
            return new JwtService({
              signOptions: { expiresIn: '2s' },
              secret: coreConfig.jwtAccessTokenSecret,
            });
          },
        });
    });

    usersTestManager = new UsersTestManager(app);
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create use', async () => {
    const body = {
      login: 'testUser',
      password: 'test123',
      email: 'test1@email.com',
    };

    const createResponse = await request(httpServer)
      .post(`/${GLOBAL_PREFIX}/users`)
      .auth('sa', '123')
      .send(body)
      .expect(HttpStatus.CREATED);

    expect(createResponse.body).toEqual(
      expect.objectContaining({
        login: body.login,
        email: body.email,
        id: expect.any(String),
        createdAt: expect.any(String),
      }),
    );

    const response = await request(httpServer)
      .get(`/${GLOBAL_PREFIX}/users`)
      .auth('sa', '123')
      .expect(HttpStatus.OK);

    expect(response.body.items).toHaveLength(1);
  });

  it('should get users with paging', async () => {
    const users = await usersTestManager.createTestUsers(12);
    const { body: responseBody } = await request(httpServer)
      .get(`/${GLOBAL_PREFIX}/users?pageNumber=2&sortDirection=asc`)
      .auth('sa', '123')
      .expect(HttpStatus.OK);

    expect(responseBody).not.toBeNull();
    expect(responseBody.totalCount).toBe(12);
    expect(responseBody.items).toHaveLength(2);
    expect(responseBody.pagesCount).toBe(2);
    expect(responseBody.items[1]).toEqual(users[users.length - 1]);
  });

  it('should return users info while "me" request with correct accessTokens', async () => {
    const tokens = await usersTestManager.createAndLoginTestUsers(1);
    const response = await request(httpServer)
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .auth(tokens[0].accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      email: expect.anything(),
      login: expect.anything(),
      userId: expect.anything(),
    });
  });

  it(`shouldn't return users info while "me" request if accessTokens expired`, async () => {
    const tokens = await usersTestManager.createAndLoginTestUsers(1);

    await delay(2000);
    await request(httpServer)
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .auth(tokens[0].accessToken, { type: 'bearer' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`should register user without really send email`, async () => {
    await request(httpServer)
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send({
        login: 'login123',
        password: '123123123',
        email: 'email@email.em',
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`should call email sending method while registration`, async () => {
    app.get(MailNotifications).sendConfirmation = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const sendEmailMethod = jest.spyOn(
      app.get(MailNotifications),
      'sendConfirmation',
    );

    await request(httpServer)
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send({
        login: 'login123',
        password: '123123123',
        email: 'email@email.em',
      })
      .expect(HttpStatus.NO_CONTENT);

    expect(sendEmailMethod).toHaveBeenCalled();
  });
});
