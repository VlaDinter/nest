import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPostsRepository } from '../../interfaces/posts.repository.interface';
import { Post, PostModelType } from '../../entities/post.schema';
import { PaginationType } from '../../../../types/PaginationType';
import { PostViewModel } from '../../view-models/post-view-model';
import { FiltersType } from '../../../../types/FiltersType';
import { PostDto } from '../../dto/Post.dto';

@Injectable()
export class PostsMongooseRepository extends IPostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {
    super();
  }

  findPosts(
    filters: FiltersType,
    blogId?: string,
  ): Promise<PaginationType<PostViewModel>> {
    return this.PostModel.filterPosts(filters, this.PostModel, blogId);
  }

  async findPost(postId: string): Promise<PostViewModel | null> {
    const postInstance = await this.PostModel.findOne({ id: postId }).exec();

    if (!postInstance) {
      return postInstance;
    }

    return postInstance.mapDBPostToPostViewModel();
  }

  async createPost(
    createPostDto: PostDto,
    blogName: string,
  ): Promise<PostViewModel> {
    const postInstance = await this.PostModel.setPost(
      createPostDto,
      this.PostModel,
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

    return postInstance;
  }

  async deletePost(postId: string): Promise<PostViewModel | null> {
    const postInstance = await this.PostModel.findOne({ id: postId });

    if (!postInstance) return null;

    await postInstance.deleteOne();

    return postInstance;
  }

  async deleteAll(): Promise<void> {
    await this.PostModel.deleteMany();
  }
}
