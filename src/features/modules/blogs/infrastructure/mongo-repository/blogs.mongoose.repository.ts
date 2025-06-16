import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDto } from '@modules/blogs/dto/blog.dto';
import { Blog, BlogModelType } from '@modules/blogs/entities/blog.schema';
import { BlogViewModel } from '@modules/blogs/models/output/blog-view.model';
import { BlogsRepository } from '@modules/blogs/infrastructure/blogs.repository';
import { IPagination } from '@src/features/base/interfaces/pagination.interface';
import { IPaginationParams } from '@src/features/base/interfaces/pagination-params.interface';

@Injectable()
export class BlogsMongooseRepository extends BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: BlogModelType,
  ) {
    super();
  }

  findBlogs(params: IPaginationParams): Promise<IPagination<BlogViewModel>> {
    return this.BlogModel.paginated(params);
  }

  async findBlog(blogId: string): Promise<BlogViewModel | null> {
    const blogInstance = await this.BlogModel.findOne({ id: blogId }).exec();

    if (!blogInstance) {
      return blogInstance;
    }

    return blogInstance.mapToViewModel();
  }

  async createBlog(createBlogDto: BlogDto): Promise<BlogViewModel> {
    const blogInstance = await this.BlogModel.setBlog(createBlogDto);

    await blogInstance.save();

    return blogInstance.mapToViewModel();
  }

  async updateBlog(
    blogId: string,
    updateBlogDto: BlogDto,
  ): Promise<BlogViewModel | null> {
    const blogInstance = await this.BlogModel.findOne({ id: blogId }).exec();

    if (!blogInstance) return null;

    blogInstance.name = updateBlogDto.name;
    blogInstance.websiteUrl = updateBlogDto.websiteUrl;
    blogInstance.description = updateBlogDto.description;

    await blogInstance.save();

    return blogInstance.mapToViewModel();
  }

  async deleteBlog(blogId: string): Promise<BlogViewModel | null> {
    const blogInstance = await this.BlogModel.findOne({ id: blogId }).exec();

    if (!blogInstance) return null;

    await blogInstance.deleteOne();

    return blogInstance.mapToViewModel();
  }

  async deleteAll(): Promise<void> {
    await this.BlogModel.deleteMany();
  }
}
