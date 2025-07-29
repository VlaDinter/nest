import { Injectable } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogDto } from '../../dto/blog.dto';
import { Blog } from '../../entities/blog.entity';
import { BlogsRepository } from '../blogs.repository';
import { BlogViewModel } from '../../models/output/blog-view.model';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';

@Injectable()
export class BlogsTypeormRepository extends BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {
    super();
  }

  async findBlogs(
    params: IPaginationParams,
  ): Promise<IPagination<BlogViewModel>> {
    const result = this.blogRepository.createQueryBuilder('blog');

    if (params.searchNameTerm) {
      result.where({ name: ILike(`%${params.searchNameTerm}%`) });
    }

    const [items, totalCount] = await result
      .orderBy(
        `blog.${params.sortBy}`,
        params.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip((params.pageNumber - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount();

    return {
      items,
      totalCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      pagesCount: Math.ceil(totalCount / params.pageSize),
    };
  }

  findBlog(blogId: string): Promise<BlogViewModel | null> {
    return this.blogRepository
      .createQueryBuilder('blog')
      .where('blog.id = :blogId', { blogId })
      .getOne();
  }

  async createBlog(dto: BlogDto): Promise<BlogViewModel> {
    const blog = new Blog();

    blog.name = dto.name;
    blog.websiteUrl = dto.websiteUrl;
    blog.description = dto.description;

    await this.blogRepository.save(blog);

    return blog;
  }

  async updateBlog(
    blogId: string,
    dto: BlogDto,
  ): Promise<BlogViewModel | null> {
    await this.blogRepository.update(blogId, {
      name: dto.name,
      websiteUrl: dto.websiteUrl,
      description: dto.description,
    });

    return this.blogRepository.findOneBy({ id: blogId });
  }

  async deleteBlog(blogId: string): Promise<BlogViewModel | null> {
    const blog = await this.blogRepository.findOneBy({ id: blogId });

    if (!blog) {
      return null;
    }

    await this.blogRepository.remove(blog);

    return blog;
  }

  async deleteAll(): Promise<void> {
    const blogs = await this.blogRepository.find();

    await this.blogRepository.remove(blogs);
  }
}
