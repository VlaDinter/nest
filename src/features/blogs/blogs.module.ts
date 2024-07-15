import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsMongooseRepository } from './infrastructure/mongo-repository/blogs.mongoose.repository';
import { Blog, BlogSchema } from './entities/blog.schema';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
    ]),
    forwardRef(() => PostsModule),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsMongooseRepository],
  exports: [BlogsService],
})
export class BlogsModule {}
