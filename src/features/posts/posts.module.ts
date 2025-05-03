import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsController } from './api/posts.controller';
import { PostsService } from './application/posts.service';
import { PostsMongooseRepository } from './infrastructure/mongo-repository/posts.mongoose.repository';
import { Post, PostSchema } from './entities/post.schema';
import { CommentsModule } from '../comments/comments.module';
import { CqrsModule } from '@nestjs/cqrs';

const adapters = [PostsMongooseRepository];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
    forwardRef(() => BlogsModule),
    CqrsModule,
    CommentsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, ...adapters],
  exports: [PostsService],
})
export class PostsModule {}
