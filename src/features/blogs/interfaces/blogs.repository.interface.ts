import { PaginationType } from '../../../types/PaginationType';
import { BlogViewModel } from '../view-models/blog-view-model';
import { FiltersType } from '../../../types/FiltersType';
import { BlogDto } from '../dto/blog.dto';

export abstract class IBlogsRepository {
  abstract findBlogs(
    filters: FiltersType,
  ): Promise<PaginationType<BlogViewModel>>;
  abstract findBlog(postId: string): Promise<BlogViewModel | null>;
  abstract createBlog(createBlogDto: BlogDto): Promise<BlogViewModel>;
  abstract updateBlog(
    blogId: string,
    updateBlogDto: BlogDto,
  ): Promise<BlogViewModel | null>;
  abstract deleteBlog(blogId: string): Promise<BlogViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
