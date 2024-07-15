import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsController } from './api/posts.controller';
import { PostsService } from './application/posts.service';
import { PostsMongooseRepository } from './infrastructure/mongo-repository/posts.mongoose.repository';
import { Post, PostSchema } from './entities/post.schema';
import { CommentsModule } from '../comments/comments.module';

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
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsMongooseRepository],
  exports: [PostsService],
})
export class PostsModule {}
