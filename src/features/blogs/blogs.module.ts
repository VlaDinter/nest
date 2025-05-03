import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsMongooseRepository } from './infrastructure/mongo-repository/blogs.mongoose.repository';
import { Blog, BlogSchema } from './entities/blog.schema';
import { PostsModule } from '../posts/posts.module';
import { AddPostWithBlogNameUseCase } from '../posts/application/use-cases/add-post-with-blog-name-use-case';
import { EditPostWithBlogNameUseCase } from '../posts/application/use-cases/edit-post-with-blog-name-use-case';
import { CqrsModule } from '@nestjs/cqrs';

const adapters = [BlogsMongooseRepository];
const useCases = [AddPostWithBlogNameUseCase, EditPostWithBlogNameUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
    ]),
    forwardRef(() => PostsModule),
    CqrsModule,
  ],
  controllers: [BlogsController],
  providers: [BlogsService, ...adapters, ...useCases],
  exports: [BlogsService],
})
export class BlogsModule {}
