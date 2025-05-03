import { BlogViewModel } from '../view-models/blog-view-model';
import { BlogDto } from '../dto/blog.dto';
import { IFilters } from '../../../interfaces/filters.interface';
import { IPagination } from '../../../interfaces/pagination.interface';

export abstract class IBlogsRepository {
  abstract findBlogs(filters: IFilters): Promise<IPagination<BlogViewModel>>;
  abstract findBlog(postId: string): Promise<BlogViewModel | null>;
  abstract createBlog(createBlogDto: BlogDto): Promise<BlogViewModel>;
  abstract updateBlog(
    blogId: string,
    updateBlogDto: BlogDto,
  ): Promise<BlogViewModel | null>;
  abstract deleteBlog(blogId: string): Promise<BlogViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
