import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentViewModel } from '../view-models/comment-view-model';
import { IPagination } from '../../../interfaces/pagination.interface';
import { IFilters } from '../../../interfaces/filters.interface';
import { ISortDirections } from '../../../interfaces/sort-directions.interface';

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
export class LikesInfo {
  @Prop({
    type: String,
    default: 'None',
  })
  myStatus: string;

  @Prop({
    type: Number,
    default: 0,
  })
  likesCount: number;

  @Prop({
    type: Number,
    default: 0,
  })
  dislikesCount: number;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

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
    default: {},
  })
  commentatorInfo: CommentatorInfo;

  @Prop({
    type: LikesInfoSchema,
    default: {},
  })
  likesInfo: LikesInfo;

  mapDBCommentToCommentViewModel(): CommentViewModel {
    return {
      id: this.id,
      content: this.content,
      createdAt: this.createdAt,
      commentatorInfo: {
        userId: this.commentatorInfo.userId,
        userLogin: this.commentatorInfo.userLogin,
      },
      likesInfo: {
        myStatus: this.likesInfo.myStatus,
        likesCount: this.likesInfo.likesCount,
        dislikesCount: this.likesInfo.dislikesCount,
      },
    };
  }

  static async filterComments(
    CommentModel: CommentModelType,
    filters: IFilters,
  ): Promise<IPagination<CommentViewModel>> {
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
      items: result.map((comment) => comment.mapDBCommentToCommentViewModel()),
    };
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  mapDBCommentToCommentViewModel:
    Comment.prototype.mapDBCommentToCommentViewModel,
};

type CommentModelStaticType = {
  filterComments: (
    CommentModel: CommentModelType,
    filters: IFilters,
  ) => Promise<IPagination<CommentViewModel>>;
};

const commentStaticMethods: CommentModelStaticType = {
  filterComments: Comment.filterComments,
};

CommentSchema.statics = commentStaticMethods;

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & CommentModelStaticType;
