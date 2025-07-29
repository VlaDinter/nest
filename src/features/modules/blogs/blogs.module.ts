import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { BlogsController } from './api/blogs.controller';
import { Blog, BlogSchema } from './schemes/blog.schema';
import { BlogsService } from './application/blogs.service';
import { Blog as BlogEntity } from './entities/blog.entity';
import { IRepoType } from '../../base/interfaces/repo-type.interface';
import { getConfiguration } from '../../../configuration/configuration';
import { getBlogsConfiguration } from './configuration/blogs.configuration';
import { GetPostsByBlogIdUseCase } from './usecases/get-posts-by-blog-id.usecase';
import { BlogsMongooseRepository } from './infrastructure/mongo-repository/blogs.mongoose.repository';
import { BlogsTypeormRepository } from './infrastructure/typeorm-repository/blogs.typeorm.repository';

const providers = [
  {
    provide: 'BlogsRepository',
    useClass:
      getConfiguration().repoType === IRepoType.MONGO
        ? BlogsMongooseRepository
        : BlogsTypeormRepository,
  },
];

const useCases = [GetPostsByBlogIdUseCase];

@Module({
  imports: [
    forwardRef(() => PostsModule),
    ConfigModule.forFeature(getBlogsConfiguration),
    getConfiguration().repoType === IRepoType.SQL
      ? TypeOrmModule.forFeature([BlogEntity])
      : MongooseModule.forFeature([
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
