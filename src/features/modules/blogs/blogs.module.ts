import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { PostsModule } from '@modules/posts/posts.module';
import { BlogsController } from '@modules/blogs/api/blogs.controller';
import { Blog, BlogSchema } from '@modules/blogs/entities/blog.schema';
import { BlogsService } from '@modules/blogs/application/blogs.service';
import { getBlogsConfiguration } from '@modules/blogs/configuration/blogs.configuration';
import { GetPostsByBlogIdUseCase } from '@modules/blogs/usecases/get-posts-by-blog-id.usecase';
import { BlogsMongooseRepository } from '@modules/blogs/infrastructure/mongo-repository/blogs.mongoose.repository';

const providers = [
  {
    provide: 'BlogsRepository',
    useClass: BlogsMongooseRepository,
  },
];

const useCases = [GetPostsByBlogIdUseCase];

@Module({
  imports: [
    forwardRef(() => PostsModule),
    ConfigModule.forFeature(getBlogsConfiguration),
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
    ]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, ...providers, ...useCases],
  exports: [BlogsService],
})
export class BlogsModule {}
