import request, { Response } from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostDto } from '@modules/posts/dto/post.dto';
import { GLOBAL_PREFIX } from '@src/setups/global-prefix.setup';

export class PostsTestManager {
  constructor(private readonly app: INestApplication) {}

  async createPost(
    createPostDto: PostDto,
    options?: {
      expectedStatusCode?: number;
    },
  ): Promise<Response> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .auth('sa', '123')
      .send(createPostDto)
      .expect(options?.expectedStatusCode ?? HttpStatus.CREATED);

    return response;
  }
}
