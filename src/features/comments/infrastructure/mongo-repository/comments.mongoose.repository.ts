import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ICommentsRepository } from '../../interfaces/posts.repository.interface';
import { Comment, CommentModelType } from '../../entities/comment.schema';
import { CommentViewModel } from '../../view-models/comment-view-model';
import { IPagination } from '../../../../interfaces/pagination.interface';
import { IFilters } from '../../../../interfaces/filters.interface';
import { CommentDto } from '../../dto/comment.dto';
import { LikeDto } from '../../dto/like.dto';
import { LikeDetailsViewModel } from '../../../posts/view-models/like-details-view-model';
import { ILikeStatus } from '../../../../interfaces/like-status.interface';

@Injectable()
export class CommentsMongooseRepository extends ICommentsRepository {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
  ) {
    super();
  }

  findComments(
    filters: IFilters,
    userId?: string,
  ): Promise<IPagination<CommentViewModel>> {
    return this.CommentModel.filterComments(this.CommentModel, filters, userId);
  }

  async findComment(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    const commentInstance = await this.CommentModel.findOne({
      id: commentId,
    }).exec();

    if (!commentInstance) {
      return commentInstance;
    }

    return commentInstance.mapDBCommentToCommentViewModel(userId);
  }

  async createComment(
    createCommentDto: CommentDto,
    postId: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel> {
    const commentInstance = await this.CommentModel.setComment(
      this.CommentModel,
      createCommentDto,
      postId,
      userId,
      userLogin,
    );

    await commentInstance.save();

    return commentInstance.mapDBCommentToCommentViewModel();
  }

  async updateComment(
    commentId: string,
    updateCommentDto: CommentDto,
  ): Promise<CommentViewModel | null> {
    const commentInstance = await this.CommentModel.findOne({
      id: commentId,
    }).exec();

    if (!commentInstance) return null;

    commentInstance.content = updateCommentDto.content;

    await commentInstance.save();

    return commentInstance.mapDBCommentToCommentViewModel();
  }

  async updateLike(
    commentId: string,
    updateLikeDto: LikeDto,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel | null> {
    const commentInstance = await this.CommentModel.findOne({
      id: commentId,
    }).exec();

    if (!commentInstance) return null;

    commentInstance.likes = commentInstance.likes.filter(
      (item: LikeDetailsViewModel): boolean => item.userId !== userId,
    );

    commentInstance.dislikes = commentInstance.dislikes.filter(
      (item: LikeDetailsViewModel): boolean => item.userId !== userId,
    );

    if (updateLikeDto.likeStatus === ILikeStatus.LIKE) {
      commentInstance.likes.push({
        addedAt: new Date().toISOString(),
        userId,
        login: userLogin,
      });
    }

    if (updateLikeDto.likeStatus === ILikeStatus.DISLIKE) {
      commentInstance.dislikes.push({
        addedAt: new Date().toISOString(),
        userId,
        login: userLogin,
      });
    }

    await commentInstance.save();

    return commentInstance.mapDBCommentToCommentViewModel();
  }

  async deleteComment(commentId: string): Promise<CommentViewModel | null> {
    const commentInstance = await this.CommentModel.findOne({
      id: commentId,
    }).exec();

    if (!commentInstance) return null;

    await commentInstance.deleteOne();

    return commentInstance.mapDBCommentToCommentViewModel();
  }

  async deleteAll(): Promise<void> {
    await this.CommentModel.deleteMany();
  }
}
