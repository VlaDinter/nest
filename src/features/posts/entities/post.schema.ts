import { HydratedDocument, Model, Types, SortOrder } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PostViewModel } from '../view-models/post-view-model';
import { PostDto } from '../dto/post.dto';
import { FiltersInterface } from '../../../interfaces/filters.interface';
import { PaginationInterface } from '../../../interfaces/pagination.interface';

@Schema()
export class LikeDetails {
  @Prop({
    type: String,
    default(): string {
      return new Date().toISOString();
    },
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
export class ExtendedLikesInfo {
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

  @Prop({
    type: [LikeDetailsSchema],
    default: [],
  })
  newestLikes: LikeDetails[];
}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);

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
    type: ExtendedLikesInfoSchema,
    default: {},
  })
  extendedLikesInfo: ExtendedLikesInfo;

  mapDBPostToPostViewModel(): PostViewModel {
    return {
      id: this.id,
      title: this.title,
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: this.blogId,
      blogName: this.blogName,
      createdAt: this.createdAt,
      extendedLikesInfo: {
        likesCount: this.extendedLikesInfo.likesCount,
        dislikesCount: this.extendedLikesInfo.dislikesCount,
        myStatus: this.extendedLikesInfo.myStatus,
        newestLikes: this.extendedLikesInfo.newestLikes.map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login,
        })),
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
    filters: FiltersInterface,
    PostModel: PostModelType,
    blogId?: string,
  ): Promise<PaginationInterface<PostViewModel>> {
    const sortBy =
      typeof filters.sortBy === 'string' ? filters.sortBy : 'createdAt';
    const sortDirection: SortOrder =
      filters.sortDirection === 'asc' ? 'asc' : 'desc';
    const pageNumber = Number.isInteger(Number(filters.pageNumber))
      ? Number(filters.pageNumber)
      : 1;
    const pageSize = Number.isInteger(Number(filters.pageSize))
      ? Number(filters.pageSize)
      : 10;
    const skip = (pageNumber - 1) * pageSize;
    const sort = { [sortBy]: sortDirection };
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
      items: result.map((post) => post.mapDBPostToPostViewModel()),
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
    filters: FiltersInterface,
    PostModel: PostModelType,
    blogId?: string,
  ) => Promise<PaginationInterface<PostViewModel>>;
};

const postStaticMethods: PostModelStaticType = {
  setPost: Post.setPost,
  filterPosts: Post.filterPosts,
};

PostSchema.statics = postStaticMethods;

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & PostModelStaticType;
