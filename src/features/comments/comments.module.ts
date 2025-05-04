import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './application/comments.service';
import { CommentsMongooseRepository } from './infrastructure/mongo-repository/comments.mongoose.repository';
import { Comment, CommentSchema } from './entities/comment.schema';
import { CqrsModule } from '@nestjs/cqrs';
import { EditCommentWithUserLoginUseCase } from './application/use-cases/edit-comment-with-user-login-use-case';
import { UsersModule } from '../users/users.module';

const adapters = [CommentsMongooseRepository];
const useCases = [EditCommentWithUserLoginUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
    UsersModule,
    CqrsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService, ...adapters, ...useCases],
  exports: [CommentsService],
})
export class CommentsModule {}
