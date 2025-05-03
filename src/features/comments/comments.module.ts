import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './application/comments.service';
import { CommentsMongooseRepository } from './infrastructure/mongo-repository/comments.mongoose.repository';
import { Comment, CommentSchema } from './entities/comment.schema';

const adapters = [CommentsMongooseRepository];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, ...adapters],
  exports: [CommentsService],
})
export class CommentsModule {}
