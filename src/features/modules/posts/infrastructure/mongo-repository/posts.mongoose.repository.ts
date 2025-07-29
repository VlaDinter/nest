import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostDto } from '../../dto/post.dto';
import { PostsRepository } from '../posts.repository';
import { PostsConfig } from '../../config/posts.config';
import { LikeDto } from '../../../comments/dto/like.dto';
import { Post, PostModelType } from '../../schemes/post.schema';
import { PostViewModel } from '../../models/output/post-view.model';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { ILikeStatus } from '../../../../base/interfaces/like-status.interface';
import { LikeDetailsViewModel } from '../../models/output/like-details-view.model';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';

@Injectable()
export class PostsMongooseRepository extends PostsRepository {
  constructor(
    private readonly postsConfig: PostsConfig,
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {
    super();
  }

  findPosts(
    params: IPaginationParams,
    userId?: string,
  ): Promise<IPagination<PostViewModel>> {
    return this.PostModel.paginated(
      params,
      this.postsConfig.newestLikesLength,
      userId,
    );
  }

  async findPost(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    const postInstance = await this.PostModel.findOne({ id: postId }).exec();

    if (!postInstance) {
      return postInstance;
    }

    return postInstance.mapToViewModel(
      this.postsConfig.newestLikesLength,
      userId,
    );
  }

  async createPost(
    createPostDto: PostDto,
    blogName: string,
  ): Promise<PostViewModel> {
    const postInstance = await this.PostModel.setPost(createPostDto, blogName);

    await postInstance.save();

    return postInstance.mapToViewModel(this.postsConfig.newestLikesLength);
  }

  async updatePost(
    postId: string,
    updatePostDto: PostDto,
    blogName: string,
  ): Promise<PostViewModel | null> {
    const postInstance = await this.PostModel.findOne({ id: postId }).exec();

    if (!postInstance) return null;

    postInstance.blogName = blogName;
    postInstance.title = updatePostDto.title;
    postInstance.blogId = updatePostDto.blogId;
    postInstance.content = updatePostDto.content;
    postInstance.shortDescription = updatePostDto.shortDescription;

    await postInstance.save();

    return postInstance.mapToViewModel(this.postsConfig.newestLikesLength);
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
        userId,
        login: userLogin,
        addedAt: new Date().toISOString(),
      });
    }

    if (updateLikeDto.likeStatus === ILikeStatus.DISLIKE) {
      postInstance.dislikes.push({
        userId,
        login: userLogin,
        addedAt: new Date().toISOString(),
      });
    }

    await postInstance.save();

    return postInstance.mapToViewModel(
      this.postsConfig.newestLikesLength,
      userId,
    );
  }

  async deletePost(postId: string): Promise<PostViewModel | null> {
    const postInstance = await this.PostModel.findOne({ id: postId }).exec();

    if (!postInstance) return null;

    await postInstance.deleteOne();

    return postInstance.mapToViewModel(this.postsConfig.newestLikesLength);
  }

  async deleteAll(): Promise<void> {
    await this.PostModel.deleteMany();
  }
}
