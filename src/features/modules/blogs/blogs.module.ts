import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { BlogsController } from './api/blogs.controller';
import { Blog, BlogSchema } from './entities/blog.schema';
import { BlogsService } from './application/blogs.service';
import { IRepoType } from '../../base/interfaces/repo-type.interface';
import { getConfiguration } from '../../../configuration/configuration';
import { getBlogsConfiguration } from './configuration/blogs.configuration';
import { GetPostsByBlogIdUseCase } from './usecases/get-posts-by-blog-id.usecase';
import { BlogsSqlRepository } from './infrastructure/sql-repository/blogs.sql.repository';
import { BlogsMongooseRepository } from './infrastructure/mongo-repository/blogs.mongoose.repository';

const providers = [
  {
    provide: 'BlogsRepository',
    useClass:
      getConfiguration().repoType === IRepoType.MONGO
        ? BlogsMongooseRepository
        : BlogsSqlRepository,
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
