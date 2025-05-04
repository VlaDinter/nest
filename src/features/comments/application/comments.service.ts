import { Injectable } from '@nestjs/common';
import { CommentViewModel } from '../view-models/comment-view-model';
import { CommentsMongooseRepository } from '../infrastructure/mongo-repository/comments.mongoose.repository';
import { IFilters } from '../../../interfaces/filters.interface';
import { IPagination } from '../../../interfaces/pagination.interface';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { CommentDto } from '../dto/comment.dto';
import { LikeDto } from '../dto/like.dto';
import { ILikeStatus } from '../../../interfaces/like-status.interface';

export class CommentInputModelType {
  @Length(20, 300)
  @Matches(/\S/, {
    message: 'Incorrect Content',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  content: string;
}

export class LikeInputModelType {
  @IsEnum(ILikeStatus)
  @Matches(/\S/, {
    message: 'Incorrect Like Status',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  likeStatus: ILikeStatus;
}

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsMongooseRepository,
  ) {}

  getComments(
    filters: IFilters,
    userId?: string,
  ): Promise<IPagination<CommentViewModel>> {
    return this.commentsRepository.findComments(filters, userId);
  }

  getComment(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    return this.commentsRepository.findComment(commentId, userId);
  }

  addComment(
    createCommentDto: CommentDto,
    postId: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel | null> {
    return this.commentsRepository.createComment(
      createCommentDto,
      postId,
      userId,
      userLogin,
    );
  }

  editComment(
    commentId: string,
    updateCommentDto: CommentDto,
  ): Promise<CommentViewModel | null> {
    return this.commentsRepository.updateComment(commentId, updateCommentDto);
  }

  editLike(
    commentId: string,
    updateLikeDto: LikeDto,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel | null> {
    return this.commentsRepository.updateLike(
      commentId,
      updateLikeDto,
      userId,
      userLogin,
    );
  }

  removeComment(commentId: string): Promise<CommentViewModel | null> {
    return this.commentsRepository.deleteComment(commentId);
  }

  async removeAll(): Promise<void> {
    await this.commentsRepository.deleteAll();
  }
}
