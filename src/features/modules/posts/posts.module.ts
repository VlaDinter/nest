import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsConfig } from './config/posts.config';
import { UsersModule } from '../users/users.module';
import { PostsController } from './api/posts.controller';
import { Post, PostSchema } from './schemes/post.schema';
import { PostsService } from './application/posts.service';
import { Post as PostEntity } from './entities/post.entity';
import { CommentsModule } from '../comments/comments.module';
import { IRepoType } from '../../base/interfaces/repo-type.interface';
import { getConfiguration } from '../../../configuration/configuration';
import { getPostsConfiguration } from './configuration/posts.configuration';
import { GetCommentsByPostIdUseCase } from './usecases/get-comments-by-post-id.usecase';
import { AddPostWithBlogNameUseCase } from './usecases/add-post-with-blog-name.usecase';
import { AddCommentWithPostIdUseCase } from './usecases/add-comment-with-post-id.usecase';
import { EditPostWithBlogNameUseCase } from './usecases/edit-post-with-blog-name.usecase';
import { EditPostWithUserLoginUseCase } from './usecases/edit-post-with-user-login.usecase';
import { RemovePostWithBlogNameUseCase } from './usecases/remove-post-with-blog-name.usecase';
import { PostsMongooseRepository } from './infrastructure/mongo-repository/posts.mongoose.repository';
import { PostsTypeormRepository } from './infrastructure/typeorm-repository/posts.typeorm.repository';

const providers = [
  PostsConfig,
  {
    provide: 'PostsRepository',
    useClass:
      getConfiguration().repoType === IRepoType.MONGO
        ? PostsMongooseRepository
        : PostsTypeormRepository,
  },
];

const useCases = [
  GetCommentsByPostIdUseCase,
  AddPostWithBlogNameUseCase,
  AddCommentWithPostIdUseCase,
  EditPostWithBlogNameUseCase,
  EditPostWithUserLoginUseCase,
  RemovePostWithBlogNameUseCase,
];

@Module({
  imports: [
    UsersModule,
    CommentsModule,
    forwardRef(() => BlogsModule),
    ConfigModule.forFeature(getPostsConfiguration),
    getConfiguration().repoType === IRepoType.SQL
      ? TypeOrmModule.forFeature([PostEntity])
      : MongooseModule.forFeature([
          {
            name: Post.name,
            schema: PostSchema,
          },
        ]),
  ],
  controllers: [PostsController],
  providers: [PostsService, ...providers, ...useCases],
  exports: [PostsService],
})
export class PostsModule {}
