import { Server } from 'http';
import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { TestingModuleBuilder } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestManager } from '../users/users.test-manager';
import { initApp, skipDescribe, skipTests } from '../../helpers/helper';

skipDescribe(skipTests.for('authTest'))('AuthController (e2e)', () => {
  let httpServer: Server;
  let app: INestApplication;
  const TEST_JWT_SECRET = 'secret_key';
  const originalEnvBackup = { ...process.env };

  afterEach(() => {
    Object.keys(process.env).forEach((key: string): void => {
      if (!(key in originalEnvBackup)) {
        delete process.env[key];
      }
    });

    Object.assign(process.env, originalEnvBackup);
  });

  beforeAll(async () => {
    app = await initApp((builder: TestingModuleBuilder) => {
      builder.overrideProvider('ACCESS_TOKEN_STRATEGY_INJECT_TOKEN').useValue(
        new JwtService({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '2s' },
        }),
      );
    });

    const usersTestManager = new UsersTestManager(app);
    const userResponse = await usersTestManager.createMainTestUser();

    expect.setState({
      testUserId: userResponse.body.id,
    });

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) should return accessToken', async () => {
    const response = await request(httpServer)
      .post('/auth/login')
      .send({
        password: 'test123',
        loginOrEmail: 'test@example.com',
      })
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('accessToken');
    expect(typeof response.body.accessToken === 'string').toBeTruthy();
  });

  it('/auth/login (POST) should return 401 for invalid password', async () => {
    await request(httpServer)
      .post('/auth/login')
      .send({ password: 'any_password', loginOrEmail: 'test@example.com' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/auth/login (POST) should return 401 for invalid login', async () => {
    const response = await request(httpServer)
      .post('/auth/login')
      .send({ password: 'test123', loginOrEmail: 'wrong@example.com' })
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('/auth/login (POST) should return a valid JWT token', async () => {
    const { testUserId } = expect.getState();
    const response = await request(httpServer)
      .post('/auth/login')
      .send({ password: 'test123', loginOrEmail: 'test@example.com' })
      .expect(HttpStatus.OK);

    const token = response.body.accessToken;

    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, TEST_JWT_SECRET);

    expect(decoded).toHaveProperty('userId', testUserId);
  });
});
