import { Injectable } from '@nestjs/common';
import { BlogsMongooseRepository } from '../infrastructure/mongo-repository/blogs.mongoose.repository';
import { BlogViewModel } from '../view-models/blog-view-model';
import { BlogDto } from '../dto/blog.dto';
import { FiltersInterface } from '../../../interfaces/filters.interface';
import { PaginationInterface } from '../../../interfaces/pagination.interface';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsMongooseRepository) {}

  getBlogs(filters: FiltersInterface): Promise<PaginationInterface<BlogViewModel>> {
    return this.blogsRepository.findBlogs(filters);
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
