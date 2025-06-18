import { Server } from 'http';
import request from 'supertest';
import { Types } from 'mongoose';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostsTestManager } from './posts.test-manager';
import { BlogsTestManager } from '../blogs/blogs.test-manager';
import { initApp, skipDescribe, skipTests } from '../../helpers/helper';

skipDescribe(skipTests.for('postsTest'))('PostsController (e2e)', () => {
  let httpServer: Server;
  let app: INestApplication;
  let postsTestManager: PostsTestManager;

  beforeAll(async () => {
    app = await initApp();
    postsTestManager = new PostsTestManager(app);

    const blogsTestManager = new BlogsTestManager(app);
    const blogResponse = await blogsTestManager.createBlog({
      name: 'Blog A',
      description: '123',
      websiteUrl: 'https://456.com',
    });

    const anotherBlogResponse = await blogsTestManager.createBlog({
      name: 'Another',
      description: '123',
      websiteUrl: 'https://456.com',
    });

    expect.setState({
      createdBlogId: blogResponse.body.id,
      anotherBlogId: anotherBlogResponse.body.id,
    });

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/posts (POST) should create an post with blogId', async () => {
    const { createdBlogId } = expect.getState();
    const postResponse = await postsTestManager.createPost({
      title: '789',
      content: '999',
      blogId: createdBlogId,
      shortDescription: '101112',
    });

    expect(postResponse.body).toHaveProperty('id');
    expect(postResponse.body.blogId).toBe(createdBlogId);
  });

  it("/posts/:id (POST) shouldn't create an post with blogId because incorrect post data", async () => {
    await request(httpServer)
      .post('/posts')
      .auth('sa', '123')
      .send({
        title: 789,
        content: '',
        blogId: 'Incorrect date',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/posts (GET) should return all posts', async () => {
    const { createdBlogId } = expect.getState();
    const postsResponse = await request(httpServer).get('/posts');

    expect(postsResponse.status).toBe(HttpStatus.OK);
    expect(postsResponse.body.items).toBeInstanceOf(Array);
    expect(postsResponse.body.items[0].blogId).toBe(createdBlogId);
  });

  it('/posts/:id (GET) should return an post by id', async () => {
    const { createdBlogId } = expect.getState();
    const postResponse = await postsTestManager.createPost({
      title: '789',
      content: '999',
      blogId: createdBlogId,
      shortDescription: '101112',
    });

    const postId = postResponse.body.id;
    const response = await request(httpServer).get(`/posts/${postId}`);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.id).toBe(postId);
    expect(response.body.blogId).toBe(createdBlogId);
  });

  it('/posts/:id (PUT) should update an post', async () => {
    const { createdBlogId, anotherBlogId } = expect.getState();
    const postResponse = await postsTestManager.createPost({
      title: '789',
      content: '999',
      blogId: createdBlogId,
      shortDescription: '101112',
    });

    const postId = postResponse.body.id;
    const response = await request(httpServer)
      .put(`/posts/${postId}`)
      .auth('sa', '123')
      .send({
        title: 'Updated',
        content: 'Updated',
        blogId: anotherBlogId,
        shortDescription: 'Updated',
      });

    expect(response.status).toBe(HttpStatus.NO_CONTENT);

    const getPostByIdResponse = await request(httpServer).get(
      `/posts/${postId}`,
    );

    expect(getPostByIdResponse.body.title).toBe('Updated');
  });

  it('/posts/:id (PUT) should update an post successfully', async () => {
    const { createdBlogId } = expect.getState();
    const postResponse = await postsTestManager.createPost({
      title: '789',
      content: '999',
      blogId: createdBlogId,
      shortDescription: '101112',
    });

    const postId = postResponse.body.id;
    const response = await request(httpServer)
      .put(`/posts/${postId}`)
      .auth('sa', '123')
      .send({
        title: 'Updated',
        content: 'Updated',
        blogId: createdBlogId,
        shortDescription: 'Updated',
      });

    expect(response.status).toBe(HttpStatus.NO_CONTENT);

    const getPostByIdResponse = await request(httpServer).get(
      `/posts/${postId}`,
    );

    expect(getPostByIdResponse.body.title).toBe('Updated');
  });

  it('/posts/:id (PUT) should return 401 for unauthorized user', async () => {
    const { createdBlogId } = expect.getState();
    const postResponse = await postsTestManager.createPost({
      title: '789',
      content: '999',
      blogId: createdBlogId,
      shortDescription: '101112',
    });

    const postId = postResponse.body.id;
    const response = await request(httpServer).put(`/posts/${postId}`).send({
      title: 'Unauthorized',
      blogId: createdBlogId,
      content: 'Unauthorized',
      shortDescription: 'Unauthorized',
    });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("/posts/:id (PUT) should return 404 for updating another post's id", async () => {
    const { createdBlogId, anotherBlogId } = expect.getState();
    await postsTestManager.createPost({
      title: '789',
      content: '999',
      blogId: createdBlogId,
      shortDescription: '101112',
    });

    const postId = new Types.ObjectId();
    const response = await request(httpServer)
      .put(`/posts/${postId}`)
      .auth('sa', '123')
      .send({
        title: 'Forbidden',
        blogId: anotherBlogId,
        content: 'Forbidden',
        shortDescription: 'Forbidden',
      });

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(response.body.message).toBe('Post not found');
  });

  it('/posts/:id (PUT) should return 400 when sending invalid data', async () => {
    const { createdBlogId } = expect.getState();
    const postResponse = await postsTestManager.createPost({
      title: '789',
      content: '999',
      blogId: createdBlogId,
      shortDescription: '101112',
    });

    const postId = postResponse.body.id;

    await request(httpServer)
      .put(`/posts/${postId}`)
      .auth('sa', '123')
      .send({
        title: 789,
        content: '',
        blogId: 'invalid-date',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/posts/:id (DELETE) should delete an post', async () => {
    const { createdBlogId } = expect.getState();
    const postResponse = await postsTestManager.createPost({
      title: '789',
      content: '999',
      blogId: createdBlogId,
      shortDescription: '101112',
    });

    const postId = postResponse.body.id;
    const deleteResponse = await request(httpServer)
      .delete(`/posts/${postId}`)
      .auth('sa', '123');

    expect(deleteResponse.status).toBe(HttpStatus.NO_CONTENT);

    const getPostByIdResponse = await request(httpServer).get(
      `/posts/${postId}`,
    );

    expect(getPostByIdResponse.status).toBe(HttpStatus.NOT_FOUND);
  });
});
