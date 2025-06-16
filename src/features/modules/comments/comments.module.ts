import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '@modules/users/users.module';
import { CommentsController } from '@modules/comments/api/comments.controller';
import { CommentsService } from '@modules/comments/application/comments.service';
import { getCommentsConfiguration } from '@modules/comments/configuration/comments.configuration';
import { EditCommentWithUserLoginUseCase } from '@modules/comments/usecases/edit-comment-with-user-login.usecase';
import { CommentsMongooseRepository } from '@modules/comments/infrastructure/mongo-repository/comments.mongoose.repository';
import {
  Comment,
  CommentSchema,
} from '@modules/comments/entities/comment.schema';

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
