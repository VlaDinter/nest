import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '@modules/users/users.module';
import { BlogsModule } from '@modules/blogs/blogs.module';
import { PostsConfig } from '@modules/posts/config/posts.config';
import { CommentsModule } from '@modules/comments/comments.module';
import { PostsController } from '@modules/posts/api/posts.controller';
import { Post, PostSchema } from '@modules/posts/entities/post.schema';
import { PostsService } from '@modules/posts/application/posts.service';
import { getPostsConfiguration } from '@modules/posts/configuration/posts.configuration';
import { GetCommentsByPostIdUseCase } from '@modules/posts/usecases/get-comments-by-post-id.usecase';
import { AddPostWithBlogNameUseCase } from '@modules/posts/usecases/add-post-with-blog-name.usecase';
import { AddCommentWithPostIdUseCase } from '@modules/posts/usecases/add-comment-with-post-id.usecase';
import { EditPostWithBlogNameUseCase } from '@modules/posts/usecases/edit-post-with-blog-name.usecase';
import { EditPostWithUserLoginUseCase } from '@modules/posts/usecases/edit-post-with-user-login.usecase';
import { PostsMongooseRepository } from '@modules/posts/infrastructure/mongo-repository/posts.mongoose.repository';

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
