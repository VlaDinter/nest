import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BlogDto } from '../../dto/blog.dto';
import { BlogsRepository } from '../blogs.repository';
import { BlogViewModel } from '../../models/output/blog-view.model';
import { IPagination } from '../../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';

@Injectable()
export class BlogsSqlRepository extends BlogsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async findBlogs(
    params: IPaginationParams,
  ): Promise<IPagination<BlogViewModel>> {
    const sort: string[] = [];
    const skip: string[] = [];
    const values: string[] = [];
    const filters: string[] = [];
    const offset = (params.pageNumber - 1) * params.pageSize;

    if (params.searchNameTerm) {
      values.push(`%${params.searchNameTerm}%`);
      filters.push(`name ILIKE $${values.length}`);
    }

    const where = !filters.length ? '' : `WHERE ${filters}`;
    const count = await this.dataSource.query(
      `SELECT COUNT(*) 
       FROM public."Blogs" 
       ${where}`,
      values,
    );

    const totalCount = Number(count[0].count);
    const pagesCount = Math.ceil(totalCount / params.pageSize);

    sort.push(`"${params.sortBy}"`);
    sort.push(`${params.sortDirection}`);

    const orderBy = `ORDER BY ${sort.join(' ')}`;

    values.push(`${params.pageSize}`);
    skip.push(`LIMIT $${values.length}`);
    values.push(`${offset}`);
    skip.push(`OFFSET $${values.length}`);

    const limit = skip.join(' ');
    const result = await this.dataSource.query(
      `SELECT id, name, description, website_url AS "websiteUrl", is_membership AS "isMembership", created_at AS "createdAt"
       FROM public."Blogs"
       ${where}
       ${orderBy}
       ${limit}`,
      values,
    );

    return {
      pagesCount,
      totalCount,
      items: result,
      page: params.pageNumber,
      pageSize: params.pageSize,
    };
  }

  async findBlog(blogId: string): Promise<BlogViewModel | null> {
    const result = await this.dataSource.query(
      `SELECT id, name, description, website_url AS "websiteUrl", is_membership AS "isMembership", created_at AS "createdAt"
       FROM public."Blogs"
       WHERE id = $1`,
      [blogId],
    );

    return result[0] ?? null;
  }

  async createBlog(dto: BlogDto): Promise<BlogViewModel> {
    const result = await this.dataSource.query(
      `INSERT INTO public."Blogs" 
       (name, description, website_url)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, website_url AS "websiteUrl", is_membership AS "isMembership", created_at AS "createdAt"`,
      [dto.name, dto.description, dto.websiteUrl],
    );

    return result[0];
  }

  async updateBlog(
    blogId: string,
    dto: BlogDto,
  ): Promise<BlogViewModel | null> {
    const result = await this.dataSource.query(
      `UPDATE public."Blogs"
       SET name = $2, description = $3, website_url = $4
       WHERE id = $1
       RETURNING id, name, description, website_url AS "websiteUrl", is_membership AS "isMembership", created_at AS "createdAt"`,
      [blogId, dto.name, dto.websiteUrl, dto.description],
    );

    return result[0][0] ?? null;
  }

  async deleteBlog(blogId: string): Promise<BlogViewModel | null> {
    const result = await this.dataSource.query(
      `DELETE FROM public."Blogs"
       WHERE id = $1
       RETURNING id, name, description, website_url AS "websiteUrl", is_membership AS "isMembership", created_at AS "createdAt"`,
      [blogId],
    );

    return result[0][0] ?? null;
  }

  async deleteAll(): Promise<void> {
    await this.dataSource.query('DELETE FROM public."Blogs"');
  }
}
