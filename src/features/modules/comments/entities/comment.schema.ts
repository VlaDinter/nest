import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentDto } from '@modules/comments/dto/comment.dto';
import { commentConstraints } from '@modules/comments/constants/constants';
import { IPagination } from '@src/features/base/interfaces/pagination.interface';
import { ILikeStatus } from '@src/features/base/interfaces/like-status.interface';
import { CommentViewModel } from '@modules/comments/models/output/comment-view.model';
import { LikeDetailsViewModel } from '@modules/posts/models/output/like-details-view.model';
import { IPaginationParams } from '@src/features/base/interfaces/pagination-params.interface';

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

@Schema({ timestamps: true })
export class Comment {
  createdAt: string;

  @Prop({
    unique: true,
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
    ...commentConstraints,
  })
  content: string;

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

  mapToViewModel(userId?: string): CommentViewModel {
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
      likesInfo: {
        myStatus,
        likesCount: this.likes.length,
        dislikesCount: this.dislikes.length,
      },
      commentatorInfo: {
        userId: this.commentatorInfo.userId,
        userLogin: this.commentatorInfo.userLogin,
      },
    };
  }

  static setComment(
    dto: CommentDto,
    postId: string,
    userId: string,
    userLogin: string,
  ): CommentDocument {
    const createdComment = new this();

    createdComment.postId = postId;
    createdComment.content = dto.content;
    createdComment.commentatorInfo = {
      userId,
      userLogin,
    };

    return createdComment as CommentDocument;
  }

  static async paginated(
    params: IPaginationParams,
    userId?: string,
  ): Promise<IPagination<CommentViewModel>> {
    const CommentModel = this as CommentModelType;
    const skip = (params.pageNumber - 1) * params.pageSize;
    const sort = { [params.sortBy]: params.sortDirection };
    const query = CommentModel.find();

    if (params.postId) {
      query.where({ postId: params.postId });
    }

    const totalCount = await CommentModel.countDocuments(
      query.getFilter(),
    ).lean();

    const result = await query
      .sort(sort)
      .skip(skip)
      .limit(params.pageSize)
      .exec();

    const pagesCount = Math.ceil(totalCount / params.pageSize);

    return {
      totalCount,
      pagesCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      items: result.map(
        (comment: CommentDocument): CommentViewModel =>
          comment.mapToViewModel(userId),
      ),
    };
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
