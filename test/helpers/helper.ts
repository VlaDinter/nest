import { Connection } from 'mongoose';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { appSettings } from '../../src/settings/app.settings';
import { initAppModule } from '../../src/init/app-module.init';
import { MailNotificationsMock } from '../mock/mail-notifications.mock';
import { MailNotifications } from '../../src/features/base/adapters/mail-notifications';

export type TestNames =
  | 'appTest'
  | 'authTest'
  | 'usersTest'
  | 'blogsTest'
  | 'postsTest'
  | 'commentsTest'
  | 'testingTest';

export const skipTests = {
  run_all_tests: true,
  appTest: false,
  authTest: false,
  usersTest: false,
  blogsTest: false,
  postsTest: false,
  commentsTest: false,
  testingTest: false,
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
    imports: [appModule],
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
  return request(app.getHttpServer()).delete('/testing/all-data');
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
