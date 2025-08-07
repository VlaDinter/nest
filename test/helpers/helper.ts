import { Connection } from 'mongoose';
import request, { Response } from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { appSettings } from '../../src/settings/app.settings';
import { initAppModule } from '../../src/init/app-module.init';
import { GLOBAL_PREFIX } from '../../src/setups/global-prefix.setup';
import { MailNotificationsMock } from '../mock/mail-notifications.mock';
import { User } from '../../src/features/modules/users/entities/user.entity';
import { Device } from '../../src/features/modules/devices/entities/device.entity';
import { MailNotifications } from '../../src/features/base/adapters/mail-notifications';
import { PluralNamingStrategy } from '../../src/features/common/strategies/naming.strategy';
import { EmailConfirmation } from '../../src/features/modules/users/entities/email-confirmation.entity';

export type TestNames =
  | 'appTest'
  | 'authTest'
  | 'usersTest'
  | 'blogsTest'
  | 'postsTest'
  | 'devicesTest'
  | 'commentsTest'
  | 'testingTest';

export const skipTests = {
  appTest: false,
  authTest: false,
  usersTest: false,
  blogsTest: false,
  postsTest: false,
  devicesTest: false,
  testingTest: false,
  commentsTest: false,
  run_all_tests: true,
  for(testName: TestNames): boolean {
    if (this.run_all_tests) {
      return false;
    }

    if (typeof this[testName] === 'boolean') {
      return this[testName];
    }

    return false;
  },
};

export const initApp = async (
  customBuilderSetup?: (builder: TestingModuleBuilder) => void,
): Promise<INestApplication> => {
  const appModule = await initAppModule();
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [
      appModule,
      TypeOrmModule.forRoot({
        port: 5432,
        type: 'postgres',
        username: 'root',
        password: '3307',
        database: 'test',
        host: 'localhost',
        synchronize: true,
        namingStrategy: new PluralNamingStrategy(),
        entities: [User, EmailConfirmation, Device],
      }),
    ],
    providers: [MailNotifications],
  })
    .overrideProvider(MailNotifications)
    .useClass(MailNotificationsMock);

  if (customBuilderSetup) {
    customBuilderSetup(testingModuleBuilder);
  }

  const moduleFixture: TestingModule = await testingModuleBuilder.compile();
  const app: INestApplication = moduleFixture.createNestApplication();

  appSettings(app, appModule);

  await app.init();
  await clearDB(moduleFixture);

  return app;
};

export const clearDB = async (moduleFixture: TestingModule): Promise<void> => {
  const connection = moduleFixture.get<Connection>(getConnectionToken());
  const collections = await connection.db.listCollections().toArray();

  for (const collection of collections) {
    await connection.db.collection(collection.name).deleteMany({});
  }
};

export const skipDescribe = (skip: boolean): jest.Describe => {
  if (skip) {
    return describe.skip;
  }

  return describe;
};

export const deleteAllData = async (
  app: INestApplication,
): Promise<Response> => {
  return request(app.getHttpServer()).delete(
    `/${GLOBAL_PREFIX}/testing/all-data`,
  );
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
