import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeDto } from '../../dto/like.dto';
import { CommentDto } from '../../dto/comment.dto';
import { CommentsRepository } from '../comments.repository';
import { CommentViewModel } from '../../models/output/comment-view.model';
import { Comment, CommentModelType } from '../../entities/comment.schema';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { ILikeStatus } from '../../../../base/interfaces/like-status.interface';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';
import { LikeDetailsViewModel } from '../../../posts/models/output/like-details-view.model';

@Injectable()
export class CommentsMongooseRepository extends CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
  ) {
    super();
  }

  findComments(
    params: IPaginationParams,
    userId?: string,
  ): Promise<IPagination<CommentViewModel>> {
    return this.CommentModel.paginated(params, userId);
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

    return commentInstance.mapToViewModel(userId);
  }

  async createComment(
    createCommentDto: CommentDto,
    postId: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel> {
    const commentInstance = await this.CommentModel.setComment(
      createCommentDto,
      postId,
      userId,
      userLogin,
    );

    await commentInstance.save();

    return commentInstance.mapToViewModel();
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

    return commentInstance.mapToViewModel();
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
        userId,
        login: userLogin,
        addedAt: new Date().toISOString(),
      });
    }

    if (updateLikeDto.likeStatus === ILikeStatus.DISLIKE) {
      commentInstance.dislikes.push({
        userId,
        login: userLogin,
        addedAt: new Date().toISOString(),
      });
    }

    await commentInstance.save();

    return commentInstance.mapToViewModel(userId);
  }

  async deleteComment(commentId: string): Promise<CommentViewModel | null> {
    const commentInstance = await this.CommentModel.findOne({
      id: commentId,
    }).exec();

    if (!commentInstance) return null;

    await commentInstance.deleteOne();

    return commentInstance.mapToViewModel();
  }

  async deleteAll(): Promise<void> {
    await this.CommentModel.deleteMany();
  }
}
