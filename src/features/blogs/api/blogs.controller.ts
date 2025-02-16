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
import { BlogInputModelType, BlogPostInputModelType, BlogsService } from '../application/blogs.service';
import { BlogViewModel } from '../view-models/blog-view-model';
import { PostViewModel } from '../../posts/view-models/post-view-model';
import { PostsService } from '../../posts/application/posts.service';
import { PaginationInterface } from '../../../interfaces/pagination.interface';
import { FiltersInterface } from '../../../interfaces/filters.interface';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  getBlogs(
    @Query() filters: FiltersInterface,
  ): Promise<PaginationInterface<BlogViewModel>> {
    return this.blogsService.getBlogs(filters);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string): Promise<BlogViewModel | void> {
    const foundBlog = await this.blogsService.getBlog(blogId);

    if (!foundBlog) {
      throw new NotFoundException('Blog not found');
    }

    return foundBlog;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  postBlogs(@Body() inputModel: BlogInputModelType): Promise<BlogViewModel> {
    return this.blogsService.addBlog(inputModel);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putBlog(
    @Param('id') blogId: string,
    @Body() inputModel: BlogInputModelType
  ): Promise<void> {
    const updatedBlog = await this.blogsService.editBlog(blogId, inputModel);

    if (!updatedBlog) {
      throw new NotFoundException('Blog not found');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string): Promise<void> {
    const deletedBlog = await this.blogsService.removeBlog(blogId);

    if (!deletedBlog) {
      throw new NotFoundException('Blog not found');
    }
  }

  @Get(':blogId/posts')
  async getPosts(
    @Param('blogId') blogId: string,
    @Query() filters: FiltersInterface,
  ): Promise<PaginationInterface<PostViewModel>> {
    const foundBlog = await this.blogsService.getBlog(blogId);

    if (!foundBlog) {
      throw new NotFoundException('Blog not found');
    }

    return this.postsService.getPosts(filters, blogId);
  }

  @Post(':blogId/posts')
  async postPosts(
    @Param('blogId') blogId: string,
    @Body() inputModel: BlogPostInputModelType
  ): Promise<PostViewModel> {
    const foundBlog = await this.blogsService.getBlog(blogId);

    if (!foundBlog) {
      throw new NotFoundException('Blog not found');
    }

    return this.postsService.addPost({ ...inputModel, blogId });
  }
}
