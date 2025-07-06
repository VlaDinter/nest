import request, { Response } from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { delay } from '../../helpers/helper';
import { GLOBAL_PREFIX } from '../../../src/setups/global-prefix.setup';

export class UsersTestManager {
  constructor(private readonly app: INestApplication) {}

  async createMainTestUser(): Promise<Response> {
    const userResponse = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .auth('sa', '123')
      .send({
        login: 'user',
        password: 'test123',
        email: 'test@example.com',
      })
      .expect(HttpStatus.CREATED);

    return userResponse;
  }

  async login(
    login: string,
    password: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<{ accessToken: string }> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send({ loginOrEmail: login, password })
      .expect(statusCode);

    return {
      accessToken: response.body.accessToken,
    };
  }

  async createTestUsers(count: number): Promise<Response[]> {
    const usersPromises: Response[] = [];

    for (let i = 0; i < count; ++i) {
      await delay(50);

      const response = await request(this.app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/sa/users`)
        .auth('sa', '123')
        .send({
          login: 'test' + i,
          password: '123456789',
          email: `test${i}@gmail.com`,
        })
        .expect(HttpStatus.CREATED);

      usersPromises.push(response.body);
    }

    return Promise.all(usersPromises);
  }

  async createAndLoginTestUsers(
    count: number,
  ): Promise<{ accessToken: string }[]> {
    const users = await this.createTestUsers(count);
    const loginPromises = users.map(
      (user: Response): Promise<{ accessToken: string }> =>
        this.login(user['login'], '123456789'),
    );

    return await Promise.all(loginPromises);
  }
}
