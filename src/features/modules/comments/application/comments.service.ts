import { Inject, Injectable } from '@nestjs/common';
import { LikeDto } from '../dto/like.dto';
import { CommentDto } from '../dto/comment.dto';
import { CommentViewModel } from '../models/output/comment-view.model';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

@Injectable()
export class CommentsService {
  constructor(
    @Inject('CommentsRepository')
    private readonly commentsRepository: CommentsRepository,
  ) {}

  getComments(
    params: IPaginationParams,
    userId?: string,
  ): Promise<IPagination<CommentViewModel>> {
    return this.commentsRepository.findComments(params, userId);
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
