import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './application/comments.service';
import { CommentsMongooseRepository } from './infrastructure/mongo-repository/comments.mongoose.repository';
import { Comment, CommentSchema } from './entities/comment.schema';

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
  providers: [CommentsService, CommentsMongooseRepository],
  exports: [CommentsService],
})
export class CommentsModule {}
