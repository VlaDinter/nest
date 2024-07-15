import {
  Put,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  HttpCode,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { PaginationType } from '../../../types/PaginationType';
import { PostViewModel } from '../view-models/post-view-model';
import { PostsService } from '../application/posts.service';
import { FiltersType } from '../../../types/FiltersType';
import { PostDto } from '../dto/post.dto';
import { CommentViewModel } from '../../comments/view-models/comment-view-model';
import { CommentsService } from '../../comments/application/comments.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  getPosts(
    @Query() filters: FiltersType,
  ): Promise<PaginationType<PostViewModel>> {
    return this.postsService.getPosts(filters);
  }

  @Get(':id')
  async getPost(@Param('id') postId: string): Promise<PostViewModel | void> {
    const foundPost = await this.postsService.getPost(postId);

    if (!foundPost) {
      throw new NotFoundException('Post not found');
    }

    return foundPost;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  postPosts(@Body() createPostDto: PostDto): Promise<PostViewModel> {
    return this.postsService.addPost(createPostDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putPost(
    @Param('id') postId: string,
    @Body() updatePostDto: PostDto,
  ): Promise<void> {
    const updatedPost = await this.postsService.editPost(postId, updatePostDto);

    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string): Promise<void> {
    const deletedPost = await this.postsService.removePost(postId);

    if (!deletedPost) {
      throw new NotFoundException('Post not found');
    }
  }

  @Get(':postId/comments')
  async getComments(
    @Param('postId') postId: string,
    @Query() filters: FiltersType,
  ): Promise<PaginationType<CommentViewModel>> {
    const foundPost = await this.postsService.getPost(postId);

    if (!foundPost) {
      throw new NotFoundException('Post not found');
    }

    return this.commentsService.getComments(filters);
  }
}
