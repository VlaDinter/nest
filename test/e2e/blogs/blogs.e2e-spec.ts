import { Server } from 'http';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogsTestManager } from './blogs.test-manager';
import { GLOBAL_PREFIX } from '../../../src/setups/global-prefix.setup';
import { initApp, skipDescribe, skipTests } from '../../helpers/helper';

skipDescribe(skipTests.for('blogsTest'))('Blogs e2e', () => {
  let httpServer: Server;
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;

  beforeAll(async () => {
    app = await initApp();
    blogsTestManager = new BlogsTestManager(app);
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create/update blog', () => {
    let blogId: string;
    const createBlogBody = {
      name: 'name',
      description: 'description',
      websiteUrl: 'https://exemple.com',
    };

    const expectedBlog = {
      ...createBlogBody,
      isMembership: false,
      id: expect.any(String),
      createdAt: expect.any(String),
    };

    it('blog should created', async () => {
      const response = await blogsTestManager.createBlog(createBlogBody);

      expect(response.body).toEqual(expectedBlog);

      blogId = response.body.id;
    });

    it('blog should be updated', async () => {
      await request(httpServer)
        .put(`/${GLOBAL_PREFIX}/sa/blogs/${blogId}`)
        .auth('sa', '123')
        .send({ ...createBlogBody, name: 'new name' })
        .expect(HttpStatus.NO_CONTENT);

      const getBlogByIdResponse = await request(httpServer).get(
        `/${GLOBAL_PREFIX}/blogs/${blogId}`,
      );

      expect(getBlogByIdResponse.body.isMembership).toBeFalsy();
      expect(getBlogByIdResponse.body.name).toBe('new name');
    });
  });
});
