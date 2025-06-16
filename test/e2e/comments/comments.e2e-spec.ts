import { INestApplication } from '@nestjs/common';
import { initApp, skipDescribe, skipTests } from '../../helpers/helper';
import { PostsController } from '@src/features/modules/posts/api/posts.controller';

skipDescribe(skipTests.for('commentsTest'))('CommentsController', () => {
  let app: INestApplication;
  let controller: PostsController;

  beforeAll(async () => {
    app = await initApp();
    controller = app.get(PostsController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
