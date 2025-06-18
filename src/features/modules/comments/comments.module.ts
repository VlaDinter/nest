import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './application/comments.service';
import { Comment, CommentSchema } from './entities/comment.schema';
import { getCommentsConfiguration } from './configuration/comments.configuration';
import { EditCommentWithUserLoginUseCase } from './usecases/edit-comment-with-user-login.usecase';
import { CommentsMongooseRepository } from './infrastructure/mongo-repository/comments.mongoose.repository';

const providers = [
  {
    provide: 'CommentsRepository',
    useClass: CommentsMongooseRepository,
  },
];

const useCases = [EditCommentWithUserLoginUseCase];

@Module({
  imports: [
    UsersModule,
    ConfigModule.forFeature(getCommentsConfiguration),
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, ...providers, ...useCases],
  exports: [CommentsService],
})
export class CommentsModule {}
