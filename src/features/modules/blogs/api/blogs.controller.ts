import {
  Req,
  Get,
  Put,
  Post,
  Body,
  Query,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { BlogsService } from '../application/blogs.service';
import { BlogViewModel } from '../models/output/blog-view.model';
import { BlogInputModel } from '../models/input/blog-input.model';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { ParseNumberPipe } from '../../../common/pipes/parse-number.pipe';
import { PostViewModel } from '../../posts/models/output/post-view.model';
import { ParseStringPipe } from '../../../common/pipes/parse-string.pipe';
import { ParseValuesPipe } from '../../../common/pipes/parse-values.pipe';
import { getConfiguration } from '../../../../configuration/configuration';
import { BlogPostInputModel } from '../models/input/blog-post-input.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { BasicAuthGuard } from '../../../common/guards/basic/basic-auth.guard';
import { ISortDirections } from '../../../base/interfaces/sort-directions.interface';
import { ObjectIdValidationPipe } from '../../../common/pipes/object-id-validation.pipe';
import { GetPostsByBlogIdCommand } from '../usecases/commands/get-posts-by-blog-id.command';
import { AddPostWithBlogNameCommand } from '../../posts/usecases/commands/add-post-with-blog-name.command';
import { EditPostWithBlogNameCommand } from '../../posts/usecases/commands/edit-post-with-blog-name.command';
import { RemovePostWithBlogNameCommand } from '../../posts/usecases/commands/remove-post-with-blog-name.command';

@ApiTags('Blogs')
@Controller()
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsService: BlogsService,
  ) {}

  @Api('Get blogs')
  @UseGuards(BasicAuthGuard)
  @Get('blogs')
  getBlogs(
    @Query('searchNameTerm', ParseStringPipe) searchNameTerm: string,
    @Query(
      'pageSize',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageSize),
    )
    pageSize: number,
    @Query(
      'pageNumber',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageNumber),
    )
    pageNumber: number,
    @Query(
      'sortBy',
      ParseStringPipe,
      new DefaultValuePipe(getConfiguration().sortBy),
    )
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new ParseValuesPipe([ISortDirections.ASC, ISortDirections.DESC]),
      new DefaultValuePipe(getConfiguration().sortDirection),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<BlogViewModel>> {
    return this.blogsService.getBlogs({
      sortBy,
      pageSize,
      pageNumber,
      sortDirection,
      searchNameTerm,
    });
  }

  @Api('Get blog', true)
  @Get('blogs/:id')
  async getBlog(
    @Param('id', ObjectIdValidationPipe) blogId: string,
  ): Promise<BlogViewModel | void> {
    const foundBlog = await this.blogsService.getBlog(blogId);

    if (!foundBlog) {
      throw new NotFoundException('Blog not found');
    }

    return foundBlog;
  }

  @Api('Post blogs', false, true)
  @UseGuards(BasicAuthGuard)
  @Post('sa/blogs')
  @HttpCode(HttpStatus.CREATED)
  postBlogs(@Body() inputModel: BlogInputModel): Promise<BlogViewModel> {
    return this.blogsService.addBlog(inputModel);
  }

  @Api('Put blog', true, true)
  @UseGuards(BasicAuthGuard)
  @Put('sa/blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putBlog(
    @Body() inputModel: BlogInputModel,
    @Param('id', ObjectIdValidationPipe) blogId: string,
  ): Promise<void> {
    const updatedBlog = await this.blogsService.editBlog(blogId, inputModel);

    if (!updatedBlog) {
      throw new NotFoundException('Blog not found');
    }
  }

  @Api('Delete blog', true, true)
  @UseGuards(BasicAuthGuard)
  @Delete('sa/blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('id', ObjectIdValidationPipe) blogId: string,
  ): Promise<void> {
    const deletedBlog = await this.blogsService.removeBlog(blogId);

    if (!deletedBlog) {
      throw new NotFoundException('Blog not found');
    }
  }

  @Api('Get posts', true)
  @Get('blogs/:id/posts')
  async getPosts(
    @Req() req: Request,
    @Param('id', ObjectIdValidationPipe) blogId: string,
    @Query(
      'pageSize',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageSize),
    )
    pageSize: number,
    @Query(
      'pageNumber',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageNumber),
    )
    pageNumber: number,
    @Query(
      'sortBy',
      ParseStringPipe,
      new DefaultValuePipe(getConfiguration().sortBy),
    )
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new ParseValuesPipe([ISortDirections.ASC, ISortDirections.DESC]),
      new DefaultValuePipe(getConfiguration().sortDirection),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<PostViewModel>> {
    const command = new GetPostsByBlogIdCommand(
      {
        blogId,
        sortBy,
        pageSize,
        pageNumber,
        sortDirection,
      },
      req.user?.['userId'],
    );

    const foundPosts = await this.commandBus.execute<
      GetPostsByBlogIdCommand,
      IPagination<PostViewModel> | null
    >(command);

    if (!foundPosts) {
      throw new NotFoundException('Blog not found');
    }

    return foundPosts;
  }

  @Api('Post posts', true, true)
  @UseGuards(BasicAuthGuard)
  @Post('sa/blogs/:id/posts')
  async postPosts(
    @Body() inputModel: BlogPostInputModel,
    @Param('id', ObjectIdValidationPipe) blogId: string,
  ): Promise<PostViewModel> {
    const command = new AddPostWithBlogNameCommand({ ...inputModel, blogId });
    const createdPost = await this.commandBus.execute<
      AddPostWithBlogNameCommand,
      PostViewModel | null
    >(command);

    if (!createdPost) {
      throw new NotFoundException('Blog not found');
    }

    return createdPost;
  }

  @Api('Put posts', true, true)
  @UseGuards(BasicAuthGuard)
  @Put('sa/blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putPosts(
    @Body() inputModel: BlogPostInputModel,
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Param('postId', ObjectIdValidationPipe) postId: string,
  ): Promise<void> {
    const command = new EditPostWithBlogNameCommand(postId, {
      blogId,
      ...inputModel,
    });

    const updatedPost = await this.commandBus.execute<
      EditPostWithBlogNameCommand,
      PostViewModel | null
    >(command);

    if (!updatedPost) {
      throw new NotFoundException('Blog not found');
    }
  }

  @Api('Delete post', true, true)
  @UseGuards(BasicAuthGuard)
  @Delete('sa/blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Param('postId', ObjectIdValidationPipe) postId: string,
  ): Promise<void> {
    const command = new RemovePostWithBlogNameCommand(postId, blogId);

    const deletedPost = await this.commandBus.execute<
      RemovePostWithBlogNameCommand,
      PostViewModel | null
    >(command);

    if (!deletedPost) {
      throw new NotFoundException('Post not found');
    }
  }
}
