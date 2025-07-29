import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Like } from './entities/like.entity';
import { UsersModule } from '../users/users.module';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './application/comments.service';
import { Comment, CommentSchema } from './schemes/comment.schema';
import { Comment as CommentEntity } from './entities/comment.entity';
import { IRepoType } from '../../base/interfaces/repo-type.interface';
import { getConfiguration } from '../../../configuration/configuration';
import { getCommentsConfiguration } from './configuration/comments.configuration';
import { EditCommentWithUserLoginUseCase } from './usecases/edit-comment-with-user-login.usecase';
import { CommentsMongooseRepository } from './infrastructure/mongo-repository/comments.mongoose.repository';
import { CommentsTypeormRepository } from './infrastructure/typeorm-repository/comments.typeorm.repository';

const providers = [
  {
    provide: 'CommentsRepository',
    useClass:
      getConfiguration().repoType === IRepoType.MONGO
        ? CommentsMongooseRepository
        : CommentsTypeormRepository,
  },
];

const useCases = [EditCommentWithUserLoginUseCase];

@Module({
  imports: [
    UsersModule,
    ConfigModule.forFeature(getCommentsConfiguration),
    getConfiguration().repoType === IRepoType.SQL
      ? TypeOrmModule.forFeature([CommentEntity, Like])
      : MongooseModule.forFeature([
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
