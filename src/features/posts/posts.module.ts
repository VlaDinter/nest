import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsController } from './api/posts.controller';
import { PostsService } from './application/posts.service';
import { PostsMongooseRepository } from './infrastructure/mongo-repository/posts.mongoose.repository';
import { Post, PostSchema } from './entities/post.schema';
import { CommentsModule } from '../comments/comments.module';
import { CqrsModule } from '@nestjs/cqrs';
import { EditPostWithBlogNameUseCase } from './application/use-cases/edit-post-with-blog-name-use-case';
import { AddCommentWithPostIdUseCase } from './application/use-cases/add-comment-with-post-id-use-case';
import { UsersModule } from '../users/users.module';
import { EditPostWithUserLoginUseCase } from './application/use-cases/edit-post-with-user-login-use-case';
import { GetCommentsByPostIdUseCase } from './application/use-cases/get-comments-by-post-id-use-case';
import { AddPostWithBlogNameUseCase } from './application/use-cases/add-post-with-blog-name-use-case';

const adapters = [PostsMongooseRepository];
const useCases = [
  GetCommentsByPostIdUseCase,
  AddCommentWithPostIdUseCase,
  AddPostWithBlogNameUseCase,
  EditPostWithBlogNameUseCase,
  EditPostWithUserLoginUseCase,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
    forwardRef(() => BlogsModule),
    CommentsModule,
    UsersModule,
    CqrsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, ...adapters, ...useCases],
  exports: [PostsService],
})
export class PostsModule {}
