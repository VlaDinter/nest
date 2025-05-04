import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../../src/app.module';
import { EmailServiceMock } from '../../../src/features/email/application/email.service';
import { appSettings } from '../../../src/settings';

describe('Blogs e2e', () => {
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useClass(EmailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create/update blog', () => {
    let blogId: string;
    let userAccessTokens;

    beforeAll(async () => {
      userAccessTokens = await createAndLoginServeralUsers(2);
    });

    it('blog should created', async function () {
      const response = await request(httpServer)
        .post('/blogs')
        .set({ Authorization: `Bearer ${userAccessTokens[0].accessToken}` })
        .send(createBlogBody)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(expectedBlog);
      blogId = response.body.blogId;
    });

    it('blog should be updated', async function () {
      const response = await request(httpServer)
        .put(`/blogs/${blogId}`)
        .set({ Authorization: `Bearer ${userAccessTokens[0].accessToken}` })
        .send({ ...createBlogBody, title: 'new title' })
        .expect(HttpStatus.NO_CONTENT);

      expect(response.body.title).toBe('new title');
    });
  });
});
