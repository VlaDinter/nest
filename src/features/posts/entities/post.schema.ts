import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PostViewModel } from '../view-models/post-view-model';
import { PostDto } from '../dto/post.dto';
import { IFilters } from '../../../interfaces/filters.interface';
import { IPagination } from '../../../interfaces/pagination.interface';
import { ISortDirections } from '../../../interfaces/sort-directions.interface';
import { ILikeStatus } from '../../../interfaces/like-status.interface';
import { LikeDetailsViewModel } from '../view-models/like-details-view-model';

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
export class Post {
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
    type: String,
    default(): string {
      return new Date().toISOString();
    },
  })
  createdAt: string;

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

  mapDBPostToPostViewModel(userId?: string): PostViewModel {
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
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: this.blogId,
      blogName: this.blogName,
      createdAt: this.createdAt,
      extendedLikesInfo: {
        myStatus,
        likesCount: this.likes.length,
        dislikesCount: this.dislikes.length,
        newestLikes: this.likes
          .splice(-3)
          .reverse()
          .map(
            (like: LikeDetailsViewModel): LikeDetailsViewModel => ({
              addedAt: like.addedAt,
              userId: like.userId,
              login: like.login,
            }),
          ),
      },
    };
  }

  static setPost(
    PostModel: PostModelType,
    dto: PostDto,
    blogName: string,
  ): PostDocument {
    const createdPost = new PostModel({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName,
    });

    return createdPost;
  }

  static async filterPosts(
    PostModel: PostModelType,
    filters: IFilters,
    userId?: string,
  ): Promise<IPagination<PostViewModel>> {
    const blogId = filters.blogId;
    const sortBy = filters.sortBy;
    const sortDirection =
      filters.sortDirection === ISortDirections.ASC
        ? ISortDirections.ASC
        : ISortDirections.DESC;
    const pageSize = filters.pageSize > 0 ? filters.pageSize : 10;
    const pageNumber = filters.pageNumber > 0 ? filters.pageNumber : 1;
    const skip = (pageNumber - 1) * pageSize;
    const sort = !sortBy ? {} : { [sortBy]: sortDirection };
    const query = PostModel.find();

    if (blogId) {
      query.where({ blogId });
    }

    const totalCount = await PostModel.countDocuments(query.getFilter()).lean();
    const result = await query.sort(sort).skip(skip).limit(pageSize).exec();
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pageSize,
      pagesCount,
      totalCount,
      page: pageNumber,
      items: result.map((post) => post.mapDBPostToPostViewModel(userId)),
    };
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  mapDBPostToPostViewModel: Post.prototype.mapDBPostToPostViewModel,
};

type PostModelStaticType = {
  setPost: (
    PostModel: PostModelType,
    dto: PostDto,
    blogName: string,
  ) => PostDocument;
  filterPosts: (
    PostModel: PostModelType,
    filters: IFilters,
    userId?: string,
  ) => Promise<IPagination<PostViewModel>>;
};

const postStaticMethods: PostModelStaticType = {
  setPost: Post.setPost,
  filterPosts: Post.filterPosts,
};

PostSchema.statics = postStaticMethods;

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & PostModelStaticType;
