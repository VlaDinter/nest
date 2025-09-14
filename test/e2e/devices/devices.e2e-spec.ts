import { Server } from 'http';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TestingModuleBuilder } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { GLOBAL_PREFIX } from '../../../src/setups/global-prefix.setup';
import { initApp, skipTests, skipDescribe } from '../../helpers/helper';
import { UserDto } from '../../../dist/features/modules/users/dto/user.dto';
import { UsersTypeormRepository } from '../../../src/features/modules/users/infrastructure/typeorm-repository/users.typeorm.repository';
import { DevicesTypeormRepository } from '../../../src/features/modules/devices/infrastructure/typeorm-repository/devices.typeorm.repository';

skipDescribe(skipTests.for('devicesTest'))('Devices - /devices (e2e)', () => {
  const createUser = (index: number) => ({
    login: 'test' + index,
    email: `test${index}@gmail.com`,
  });

  let newUser1;
  let newUser2;
  let newUser3;
  let newUser4;
  let httpServer: Server;
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp((builder: TestingModuleBuilder) => {
      builder
        .overrideProvider('UsersRepository')
        .useClass(UsersTypeormRepository)
        .overrideProvider('DevicesRepository')
        .useClass(DevicesTypeormRepository);
    });

    httpServer = app.getHttpServer();

    const dataSource = await app.resolve(DataSource);

    await dataSource.query(`
      CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
      DECLARE
        statements CURSOR FOR
          SELECT tablename FROM pg_tables
          WHERE tableowner = username AND schemaname = 'public';
      BEGIN
        FOR stmt IN statements LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;

      SELECT truncate_tables('root');
    `);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Create [POST /users]', () => {
    return request(httpServer)
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .auth('sa', '123')
      .send({
        password: '123456789',
        ...createUser(1),
      } as UserDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        newUser1 = body;
        expect(body).toEqual({
          ...createUser(1),
          id: expect.any(String),
          createdAt: expect.any(String),
        });
      });
  });

  it('Create 2 [POST /users]', () => {
    return request(httpServer)
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .auth('sa', '123')
      .send({
        password: '123456789',
        ...createUser(2),
      } as UserDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        newUser2 = body;
        expect(body).toEqual({
          ...createUser(2),
          id: expect.any(String),
          createdAt: expect.any(String),
        });
      });
  });

  it('Create 3 [POST /users]', () => {
    return request(httpServer)
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .auth('sa', '123')
      .send({
        password: '123456789',
        ...createUser(3),
      } as UserDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        newUser3 = body;
        expect(body).toEqual({
          ...createUser(3),
          id: expect.any(String),
          createdAt: expect.any(String),
        });
      });
  });

  it('Create 4 [POST /users]', () => {
    return request(httpServer)
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .auth('sa', '123')
      .send({
        password: '123456789',
        ...createUser(4),
      } as UserDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        newUser4 = body;
        expect(body).toEqual({
          ...createUser(4),
          id: expect.any(String),
          createdAt: expect.any(String),
        });
      });
  });

  it('Get all users [GET /users]', () => {
    return request(httpServer)
      .get(`/${GLOBAL_PREFIX}/sa/users`)
      .auth('sa', '123')
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(body).toBeDefined();
      });
  });

  it('Delete one user [DELETE /users/:id]', () => {
    return request(httpServer)
      .delete(`/${GLOBAL_PREFIX}/sa/users/${newUser4.id}`)
      .auth('sa', '123')
      .expect(HttpStatus.NO_CONTENT);
  });

  let refreshToken1;

  it('Create Device', () => {
    return request(httpServer)
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .set('User-Agent', 'Test')
      .send({ loginOrEmail: newUser1.login, password: '123456789' })
      .expect(HttpStatus.OK)
      .then(({ headers, body }) => {
        refreshToken1 = headers['set-cookie'][0].split(';')[0];
        expect(body).toEqual({
          accessToken: expect.any(String),
        });
      });
  });

  let device;

  it('Get one device [GET /security/devices]', () => {
    return request(httpServer)
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', refreshToken1)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        device = body[0];
        expect(body).toBeDefined();
        expect(device).toEqual({
          title: 'Test',
          ip: expect.any(String),
          deviceId: expect.any(String),
          lastActiveDate: expect.any(String),
        });
      });
  });

  let refreshToken2;

  it('Create Device 2', () => {
    return request(httpServer)
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .set('User-Agent', 'Test')
      .send({ loginOrEmail: newUser2.login, password: '123456789' })
      .expect(HttpStatus.OK)
      .then(({ headers, body }) => {
        refreshToken2 = headers['set-cookie'][0].split(';')[0];
        expect(body).toEqual({
          accessToken: expect.any(String),
        });
      });
  });

  let refreshToken3;

  it('Create Device 3', () => {
    return request(httpServer)
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .set('User-Agent', 'Test')
      .send({ loginOrEmail: newUser3.login, password: '123456789' })
      .expect(HttpStatus.OK)
      .then(({ headers, body }) => {
        refreshToken3 = headers['set-cookie'][0].split(';')[0];
        expect(body).toEqual({
          accessToken: expect.any(String),
        });
      });
  });

  it('Delete Devices', () => {
    return request(httpServer)
      .delete(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', refreshToken3)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('incorrect delete because user try delete another device', () => {
    return request(httpServer)
      .delete(`/${GLOBAL_PREFIX}/security/devices/${device.deviceId}`)
      .set('Cookie', refreshToken2)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('delete device', () => {
    return request(httpServer)
      .delete(`/${GLOBAL_PREFIX}/security/devices/${device.deviceId}`)
      .set('Cookie', refreshToken1)
      .expect(HttpStatus.NO_CONTENT);
  });
});
