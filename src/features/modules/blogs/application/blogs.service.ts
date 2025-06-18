import { Inject, Injectable } from '@nestjs/common';
import { BlogDto } from '../dto/blog.dto';
import { BlogViewModel } from '../models/output/blog-view.model';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

@Injectable()
export class BlogsService {
  constructor(
    @Inject('BlogsRepository')
    private readonly blogsRepository: BlogsRepository,
  ) {}

  getBlogs(params: IPaginationParams): Promise<IPagination<BlogViewModel>> {
    return this.blogsRepository.findBlogs(params);
  }

  getBlog(blogId: string): Promise<BlogViewModel | null> {
    return this.blogsRepository.findBlog(blogId);
  }

  addBlog(createBlogDto: BlogDto): Promise<BlogViewModel> {
    return this.blogsRepository.createBlog(createBlogDto);
  }

  editBlog(
    blogId: string,
    updateBlogDto: BlogDto,
  ): Promise<BlogViewModel | null> {
    return this.blogsRepository.updateBlog(blogId, updateBlogDto);
  }

  removeBlog(blogId: string): Promise<BlogViewModel | null> {
    return this.blogsRepository.deleteBlog(blogId);
  }

  async removeAll(): Promise<void> {
    await this.blogsRepository.deleteAll();
  }
}
