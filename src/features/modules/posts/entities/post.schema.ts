import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PostDto } from '../dto/post.dto';
import { PostViewModel } from '../models/output/post-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { ILikeStatus } from '../../../base/interfaces/like-status.interface';
import { LikeDetailsViewModel } from '../models/output/like-details-view.model';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

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
export class Post {
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
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  shortDescription: string;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: String,
    required: true,
  })
  blogId: string;

  @Prop({
    type: String,
    required: true,
  })
  blogName: string;

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

  mapToViewModel(likesLength: number, userId?: string): PostViewModel {
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
      title: this.title,
      blogId: this.blogId,
      content: this.content,
      blogName: this.blogName,
      createdAt: this.createdAt,
      shortDescription: this.shortDescription,
      extendedLikesInfo: {
        myStatus,
        likesCount: this.likes.length,
        dislikesCount: this.dislikes.length,
        newestLikes: this.likes
          .reverse()
          .splice(0, likesLength)
          .map(
            (like: LikeDetailsViewModel): LikeDetailsViewModel => ({
              login: like.login,
              userId: like.userId,
              addedAt: like.addedAt,
            }),
          ),
      },
    };
  }

  static setPost(dto: PostDto, blogName: string): PostDocument {
    const createdPost = new this();

    createdPost.title = dto.title;
    createdPost.blogId = dto.blogId;
    createdPost.blogName = blogName;
    createdPost.content = dto.content;
    createdPost.shortDescription = dto.shortDescription;

    return createdPost as PostDocument;
  }

  static async paginated(
    params: IPaginationParams,
    newestLikesLength: number,
    userId?: string,
  ): Promise<IPagination<PostViewModel>> {
    const PostModel = this as PostModelType;
    const skip = (params.pageNumber - 1) * params.pageSize;
    const sort = { [params.sortBy]: params.sortDirection };
    const query = PostModel.find();

    if (params.blogId) {
      query.where({ blogId: params.blogId });
    }

    const totalCount = await PostModel.countDocuments(query.getFilter()).lean();
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
        (post: PostDocument): PostViewModel =>
          post.mapToViewModel(newestLikesLength, userId),
      ),
    };
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
