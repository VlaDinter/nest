import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentViewModel } from '../view-models/comment-view-model';
import { IPagination } from '../../../interfaces/pagination.interface';
import { IFilters } from '../../../interfaces/filters.interface';
import { ISortDirections } from '../../../interfaces/sort-directions.interface';
import { CommentDto } from '../dto/comment.dto';
import { ILikeStatus } from '../../../interfaces/like-status.interface';
import { LikeDetailsViewModel } from '../../posts/view-models/like-details-view-model';

@Schema()
export class CommentatorInfo {
  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
  })
  userLogin: string;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

@Schema()
export class LikeDetails {
  @Prop({
    type: String,
    required: true,
  })
  addedAt: string;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
  })
  login: string;
}

export const LikeDetailsSchema = SchemaFactory.createForClass(LikeDetails);

@Schema()
export class Comment {
  @Prop({
    type: String,
    default(): Types.ObjectId {
      return new Types.ObjectId();
    },
  })
  id: string;

  @Prop({
    type: String,
    required: true,
  })
  postId: string;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: String,
    default(): string {
      return new Date().toISOString();
    },
  })
  createdAt: string;

  @Prop({
    type: CommentatorInfoSchema,
    required: true,
  })
  commentatorInfo: CommentatorInfo;

  @Prop({
    type: [LikeDetailsSchema],
    default: [],
  })
  likes: LikeDetails[];

  @Prop({
    type: [LikeDetailsSchema],
    default: [],
  })
  dislikes: LikeDetails[];

  mapDBCommentToCommentViewModel(userId?: string): CommentViewModel {
    let myStatus = ILikeStatus.NONE;
    const isLiked = this.likes.some(
      (item: LikeDetailsViewModel): boolean => item.userId === userId,
    );

    if (isLiked) {
      myStatus = ILikeStatus.LIKE;
    }

    const isDisliked = this.dislikes.some(
      (item: LikeDetailsViewModel): boolean => item.userId === userId,
    );

    if (isDisliked) {
      myStatus = ILikeStatus.DISLIKE;
    }

    return {
      id: this.id,
      content: this.content,
      createdAt: this.createdAt,
      commentatorInfo: {
        userId: this.commentatorInfo.userId,
        userLogin: this.commentatorInfo.userLogin,
      },
      likesInfo: {
        myStatus,
        likesCount: this.likes.length,
        dislikesCount: this.dislikes.length,
      },
    };
  }

  static setComment(
    CommentModel: CommentModelType,
    dto: CommentDto,
    postId: string,
    userId: string,
    userLogin: string,
  ): CommentDocument {
    const createdComment = new CommentModel({
      postId,
      content: dto.content,
      commentatorInfo: {
        userId,
        userLogin,
      },
    });

    return createdComment;
  }

  static async filterComments(
    CommentModel: CommentModelType,
    filters: IFilters,
    userId?: string,
  ): Promise<IPagination<CommentViewModel>> {
    const postId = filters.postId;
    const sortBy = filters.sortBy;
    const sortDirection =
      filters.sortDirection === ISortDirections.ASC
        ? ISortDirections.ASC
        : ISortDirections.DESC;
    const pageSize = filters.pageSize > 0 ? filters.pageSize : 10;
    const pageNumber = filters.pageNumber > 0 ? filters.pageNumber : 1;
    const skip = (pageNumber - 1) * pageSize;
    const sort = !sortBy ? {} : { [sortBy]: sortDirection };
    const query = CommentModel.find();

    if (postId) {
      query.where({ postId });
    }

    const totalCount = await CommentModel.countDocuments(
      query.getFilter(),
    ).lean();
    const result = await query.sort(sort).skip(skip).limit(pageSize).exec();
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pageSize,
      pagesCount,
      totalCount,
      page: pageNumber,
      items: result.map((comment) =>
        comment.mapDBCommentToCommentViewModel(userId),
      ),
    };
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  mapDBCommentToCommentViewModel:
    Comment.prototype.mapDBCommentToCommentViewModel,
};

type CommentModelStaticType = {
  setComment: (
    CommentModel: CommentModelType,
    dto: CommentDto,
    postId: string,
    userId: string,
    userLogin: string,
  ) => CommentDocument;
  filterComments: (
    CommentModel: CommentModelType,
    filters: IFilters,
    userId?: string,
  ) => Promise<IPagination<CommentViewModel>>;
};

const commentStaticMethods: CommentModelStaticType = {
  setComment: Comment.setComment,
  filterComments: Comment.filterComments,
};

CommentSchema.statics = commentStaticMethods;

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & CommentModelStaticType;
