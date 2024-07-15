import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationType } from '../../../../types/PaginationType';
import { FiltersType } from '../../../../types/FiltersType';
import { IBlogsRepository } from '../../interfaces/blogs.repository.interface';
import { BlogModelType, Blog } from '../../entities/blog.schema';
import { BlogViewModel } from '../../view-models/blog-view-model';
import { BlogDto } from '../../dto/blog.dto';

@Injectable()
export class BlogsMongooseRepository extends IBlogsRepository {
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: BlogModelType,
  ) {
    super();
  }

  findBlogs(filters: FiltersType): Promise<PaginationType<BlogViewModel>> {
    return this.BlogModel.filterBlogs(filters, this.BlogModel);
  }

  findBlog(blogId: string): Promise<BlogViewModel | null> {
    return this.BlogModel.findOne({ id: blogId }, { _id: 0, __v: 0 }).lean();
  }

  async createBlog(createBlogDto: BlogDto): Promise<BlogViewModel> {
    const blogInstance = await this.BlogModel.setBlog(
      createBlogDto,
      this.BlogModel,
    );

    await blogInstance.save();

    return blogInstance.mapDBBlogToBlogViewModel();
  }

  async updateBlog(
    blogId: string,
    updateBlogDto: BlogDto,
  ): Promise<BlogViewModel | null> {
    const blogInstance = await this.BlogModel.findOne({ id: blogId }).exec();

    if (!blogInstance) return null;

    blogInstance.name = updateBlogDto.name;
    blogInstance.description = updateBlogDto.description;
    blogInstance.websiteUrl = updateBlogDto.websiteUrl;

    await blogInstance.save();

    return blogInstance;
  }

  async deleteBlog(blogId: string): Promise<BlogViewModel | null> {
    const blogInstance = await this.BlogModel.findOne({ id: blogId });

    if (!blogInstance) return null;

    await blogInstance.deleteOne();

    return blogInstance;
  }

  async deleteAll(): Promise<void> {
    await this.BlogModel.deleteMany();
  }
}
