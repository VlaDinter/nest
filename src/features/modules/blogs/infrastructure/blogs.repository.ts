import { BlogDto } from '@modules/blogs/dto/blog.dto';
import { BlogViewModel } from '@modules/blogs/models/output/blog-view.model';
import { IPagination } from '@src/features/base/interfaces/pagination.interface';
import { IPaginationParams } from '@src/features/base/interfaces/pagination-params.interface';

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
