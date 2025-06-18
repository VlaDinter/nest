import { BlogDto } from '../dto/blog.dto';
import { BlogViewModel } from '../models/output/blog-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

export abstract class BlogsRepository {
  abstract findBlogs(
    params: IPaginationParams,
  ): Promise<IPagination<BlogViewModel>>;
  abstract findBlog(postId: string): Promise<BlogViewModel | null>;
  abstract createBlog(createBlogDto: BlogDto): Promise<BlogViewModel>;
  abstract updateBlog(
    blogId: string,
    updateBlogDto: BlogDto,
  ): Promise<BlogViewModel | null>;
  abstract deleteBlog(blogId: string): Promise<BlogViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
