import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './features/users/application/users.service';
import { BlogsService } from './features/blogs/application/blogs.service';
import { PostsService } from './features/posts/application/posts.service';
import { CommentsService } from './features/comments/application/comments.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Delete('testing/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.usersService.removeAll();
    await this.blogsService.removeAll();
    await this.postsService.removeAll();
    await this.commentsService.removeAll();
  }
}
