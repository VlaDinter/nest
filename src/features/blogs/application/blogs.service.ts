import { Injectable } from '@nestjs/common';
import { BlogsMongooseRepository } from '../infrastructure/mongo-repository/blogs.mongoose.repository';
import { BlogViewModel } from '../view-models/blog-view-model';
import { BlogDto } from '../dto/blog.dto';
import { IFilters } from '../../../interfaces/filters.interface';
import { IPagination } from '../../../interfaces/pagination.interface';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
} from 'class-validator';

export class BlogInputModelType {
  @MaxLength(15)
  @Matches(/\S/, {
    message: 'Incorrect Name',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  name: string;
  @MaxLength(500)
  @Matches(/\S/, {
    message: 'Incorrect Description',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  description: string;
  @IsUrl()
  @MaxLength(100)
  @Matches(/\S/, {
    message: 'Incorrect Website Url',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  websiteUrl: string;
}

export class BlogPostInputModelType {
  @MaxLength(30)
  @Matches(/\S/, {
    message: 'Incorrect Title',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  title: string;
  @MaxLength(100)
  @Matches(/\S/, {
    message: 'Incorrect Short Description',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  shortDescription: string;
  @MaxLength(1000)
  @Matches(/\S/, {
    message: 'Incorrect Content',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  content: string;
}

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsMongooseRepository) {}

  getBlogs(filters: IFilters): Promise<IPagination<BlogViewModel>> {
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
