import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsConfig } from './config/posts.config';
import { UsersModule } from '../users/users.module';
import { PostsController } from './api/posts.controller';
import { Post, PostSchema } from './entities/post.schema';
import { PostsService } from './application/posts.service';
import { CommentsModule } from '../comments/comments.module';
import { getPostsConfiguration } from './configuration/posts.configuration';
import { GetCommentsByPostIdUseCase } from './usecases/get-comments-by-post-id.usecase';
import { AddPostWithBlogNameUseCase } from './usecases/add-post-with-blog-name.usecase';
import { AddCommentWithPostIdUseCase } from './usecases/add-comment-with-post-id.usecase';
import { EditPostWithBlogNameUseCase } from './usecases/edit-post-with-blog-name.usecase';
import { EditPostWithUserLoginUseCase } from './usecases/edit-post-with-user-login.usecase';
import { RemovePostWithBlogNameUseCase } from './usecases/remove-post-with-blog-name.usecase';
import { PostsMongooseRepository } from './infrastructure/mongo-repository/posts.mongoose.repository';

const providers = [
  PostsConfig,
  {
    provide: 'PostsRepository',
    useClass: PostsMongooseRepository,
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
    MongooseModule.forFeature([
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
