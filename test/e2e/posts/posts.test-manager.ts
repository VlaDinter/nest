import request, { Response } from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostDto } from '../../../src/features/modules/posts/dto/post.dto';

export class PostsTestManager {
  constructor(private readonly app: INestApplication) {}

  async createPost(
    createPostDto: PostDto,
    options?: {
      expectedStatusCode?: number;
    },
  ): Promise<Response> {
    const response = await request(this.app.getHttpServer())
      .post('/posts')
      .auth('sa', '123')
      .send(createPostDto)
      .expect(options?.expectedStatusCode ?? HttpStatus.CREATED);

    return response;
  }
}
