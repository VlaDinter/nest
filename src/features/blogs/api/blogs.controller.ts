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
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  BlogInputModelType,
  BlogPostInputModelType,
  BlogsService,
} from '../application/blogs.service';
import { BlogViewModel } from '../view-models/blog-view-model';
import { PostViewModel } from '../../posts/view-models/post-view-model';
import { PostsService } from '../../posts/application/posts.service';
import { IPagination } from '../../../interfaces/pagination.interface';
import { ParseStringPipe } from '../../../parse-string.pipe';
import { ISortDirections } from '../../../interfaces/sort-directions.interface';
import { CommandBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { AddPostWithBlogNameCommand } from '../../posts/application/use-cases/add-post-with-blog-name-use-case';
import { TokenAuthGuard } from '../../auth/guards/token-auth.guard';
import { GetPostsByBlogIdCommand } from '../application/use-cases/get-posts-by-blog-id-use-case';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  getBlogs(
    @Query('searchNameTerm', ParseStringPipe) searchNameTerm: string,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('sortBy', ParseStringPipe, new DefaultValuePipe('createdAt'))
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new DefaultValuePipe(ISortDirections.DESC),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<BlogViewModel>> {
    return this.blogsService.getBlogs({
      searchNameTerm,
      sortDirection,
      pageNumber,
      pageSize,
      sortBy,
    });
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string): Promise<BlogViewModel | void> {
    const foundBlog = await this.blogsService.getBlog(blogId);

    if (!foundBlog) {
      throw new NotFoundException('Blog not found');
    }

    return foundBlog;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  postBlogs(@Body() inputModel: BlogInputModelType): Promise<BlogViewModel> {
    return this.blogsService.addBlog(inputModel);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putBlog(
    @Param('id') blogId: string,
    @Body() inputModel: BlogInputModelType,
  ): Promise<void> {
    const updatedBlog = await this.blogsService.editBlog(blogId, inputModel);

    if (!updatedBlog) {
      throw new NotFoundException('Blog not found');
    }
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string): Promise<void> {
    const deletedBlog = await this.blogsService.removeBlog(blogId);

    if (!deletedBlog) {
      throw new NotFoundException('Blog not found');
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get(':blogId/posts')
  async getPosts(
    @Param('blogId') blogId: string,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('sortBy', ParseStringPipe, new DefaultValuePipe('createdAt'))
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new DefaultValuePipe(ISortDirections.DESC),
    )
    sortDirection: ISortDirections,
    @Request() req,
  ): Promise<IPagination<PostViewModel>> {
    const foundPosts = await this.commandBus.execute(
      new GetPostsByBlogIdCommand(
        {
          blogId,
          sortDirection,
          pageNumber,
          pageSize,
          sortBy,
        },
        req.user?.userId,
      ),
    );

    if (!foundPosts) {
      throw new NotFoundException('Blog not found');
    }

    return foundPosts;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async postPosts(
    @Param('blogId') blogId: string,
    @Body() inputModel: BlogPostInputModelType,
  ): Promise<PostViewModel> {
    const createdPost = await this.commandBus.execute(
      new AddPostWithBlogNameCommand({ ...inputModel, blogId }),
    );

    if (!createdPost) {
      throw new NotFoundException('Blog not found');
    }

    return createdPost;
  }
}
