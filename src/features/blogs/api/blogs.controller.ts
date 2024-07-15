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
import { FiltersType } from '../../../types/FiltersType';
import { BlogsService } from '../application/blogs.service';
import { BlogViewModel } from '../view-models/blog-view-model';
import { BlogDto } from '../dto/blog.dto';
import { PostViewModel } from '../../posts/view-models/post-view-model';
import { PostsService } from '../../posts/application/posts.service';
import { PostDto } from '../../posts/dto/post.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  getBlogs(
    @Query() filters: FiltersType,
  ): Promise<PaginationType<BlogViewModel>> {
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
  postBlogs(@Body() createBlogDto: BlogDto): Promise<BlogViewModel> {
    return this.blogsService.addBlog(createBlogDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: BlogDto,
  ): Promise<void> {
    const updatedBlog = await this.blogsService.editBlog(blogId, updateBlogDto);

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
    @Query() filters: FiltersType,
  ): Promise<PaginationType<PostViewModel>> {
    const foundBlog = await this.blogsService.getBlog(blogId);

    if (!foundBlog) {
      throw new NotFoundException('Blog not found');
    }

    return this.postsService.getPosts(filters, blogId);
  }

  @Post(':blogId/posts')
  async postPosts(
    @Param('blogId') blogId: string,
    @Body() createPostDto: PostDto,
  ): Promise<PostViewModel> {
    const foundBlog = await this.blogsService.getBlog(blogId);

    if (!foundBlog) {
      throw new NotFoundException('Blog not found');
    }

    return this.postsService.addPost({ ...createPostDto, blogId });
  }
}
