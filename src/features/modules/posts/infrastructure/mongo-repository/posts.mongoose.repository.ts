import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostDto } from '@modules/posts/dto/post.dto';
import { LikeDto } from '@modules/comments/dto/like.dto';
import { PostsConfig } from '@modules/posts/config/posts.config';
import { Post, PostModelType } from '@modules/posts/entities/post.schema';
import { PostViewModel } from '@modules/posts/models/output/post-view.model';
import { PostsRepository } from '@modules/posts/infrastructure/posts.repository';
import { IPagination } from '@src/features/base/interfaces/pagination.interface';
import { ILikeStatus } from '@src/features/base/interfaces/like-status.interface';
import { LikeDetailsViewModel } from '@modules/posts/models/output/like-details-view.model';
import { IPaginationParams } from '@src/features/base/interfaces/pagination-params.interface';

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

    return postInstance.mapToViewModel(this.postsConfig.newestLikesLength);
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
