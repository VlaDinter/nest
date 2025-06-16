import request, { Response } from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogDto } from '@modules/blogs/dto/blog.dto';
import { GLOBAL_PREFIX } from '@src/setups/global-prefix.setup';

export class BlogsTestManager {
  constructor(private readonly app: INestApplication) {}

  async createBlog(
    createBlogDto: BlogDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<Response> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .auth('sa', '123')
      .send(createBlogDto)
      .expect(statusCode);

    return response;
  }
}
