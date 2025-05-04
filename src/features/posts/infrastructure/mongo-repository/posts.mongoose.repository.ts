import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPostsRepository } from '../../interfaces/posts.repository.interface';
import { Post, PostModelType } from '../../entities/post.schema';
import { PostViewModel } from '../../view-models/post-view-model';
import { PostDto } from '../../dto/Post.dto';
import { IFilters } from '../../../../interfaces/filters.interface';
import { IPagination } from '../../../../interfaces/pagination.interface';
import { LikeDto } from '../../../comments/dto/like.dto';
import { LikeDetailsViewModel } from '../../view-models/like-details-view-model';
import { ILikeStatus } from '../../../../interfaces/like-status.interface';

@Injectable()
export class PostsMongooseRepository extends IPostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {
    super();
  }

  findPosts(
    filters: IFilters,
    userId?: string,
  ): Promise<IPagination<PostViewModel>> {
    return this.PostModel.filterPosts(this.PostModel, filters, userId);
  }

  async findPost(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    const postInstance = await this.PostModel.findOne({ id: postId }).exec();

    if (!postInstance) {
      return postInstance;
    }

    return postInstance.mapDBPostToPostViewModel(userId);
  }

  async createPost(
    createPostDto: PostDto,
    blogName: string,
  ): Promise<PostViewModel> {
    const postInstance = await this.PostModel.setPost(
      this.PostModel,
      createPostDto,
      blogName,
    );

    await postInstance.save();

    return postInstance.mapDBPostToPostViewModel();
  }

  async updatePost(
    postId: string,
    updatePostDto: PostDto,
    blogName: string,
  ): Promise<PostViewModel | null> {
    const postInstance = await this.PostModel.findOne({ id: postId }).exec();

    if (!postInstance) return null;

    postInstance.title = updatePostDto.title;
    postInstance.shortDescription = updatePostDto.shortDescription;
    postInstance.content = updatePostDto.content;
    postInstance.blogId = updatePostDto.blogId;
    postInstance.blogName = blogName;

    await postInstance.save();

    return postInstance.mapDBPostToPostViewModel();
  }

  async updateLike(
    postId: string,
    updateLikeDto: LikeDto,
    userId: string,
    userLogin: string,
  ): Promise<PostViewModel | null> {
    const postInstance = await this.PostModel.findOne({
      id: postId,
    }).exec();

    if (!postInstance) return null;

    postInstance.likes = postInstance.likes.filter(
      (item: LikeDetailsViewModel): boolean => item.userId !== userId,
    );

    postInstance.dislikes = postInstance.dislikes.filter(
      (item: LikeDetailsViewModel): boolean => item.userId !== userId,
    );

    if (updateLikeDto.likeStatus === ILikeStatus.LIKE) {
      postInstance.likes.push({
        addedAt: new Date().toISOString(),
        userId,
        login: userLogin,
      });
    }

    if (updateLikeDto.likeStatus === ILikeStatus.DISLIKE) {
      postInstance.dislikes.push({
        addedAt: new Date().toISOString(),
        userId,
        login: userLogin,
      });
    }

    await postInstance.save();

    return postInstance.mapDBPostToPostViewModel();
  }

  async deletePost(postId: string): Promise<PostViewModel | null> {
    const postInstance = await this.PostModel.findOne({ id: postId }).exec();

    if (!postInstance) return null;

    await postInstance.deleteOne();

    return postInstance.mapDBPostToPostViewModel();
  }

  async deleteAll(): Promise<void> {
    await this.PostModel.deleteMany();
  }
}
