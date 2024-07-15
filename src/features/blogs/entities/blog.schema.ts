import { HydratedDocument, Model, Types, SortOrder } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PaginationType } from '../../../types/PaginationType';
import { FiltersType } from '../../../types/FiltersType';
import { BlogViewModel } from '../view-models/blog-view-model';
import { BlogDto } from '../dto/blog.dto';

@Schema()
export class Blog {
  @Prop({
    type: String,
    default(): Types.ObjectId {
      return new Types.ObjectId();
    },
  })
  id: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: String,
    required: true,
  })
  websiteUrl: string;

  @Prop({
    type: String,
    default(): string {
      return new Date().toISOString();
    },
  })
  createdAt: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  isMembership: boolean;

  mapDBBlogToBlogViewModel(): BlogViewModel {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      createdAt: this.createdAt,
      isMembership: this.isMembership,
    };
  }

  static setBlog(dto: BlogDto, BlogModel: BlogModelType): BlogDocument {
    const createdBlog = new BlogModel({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    return createdBlog;
  }

  static async filterBlogs(
    filters: FiltersType,
    BlogModel: BlogModelType,
  ): Promise<PaginationType<BlogViewModel>> {
    const sortBy =
      typeof filters.sortBy === 'string' ? filters.sortBy : 'createdAt';
    const sortDirection: SortOrder =
      filters.sortDirection === 'asc' ? 'asc' : 'desc';
    const pageNumber = Number.isInteger(Number(filters.pageNumber))
      ? Number(filters.pageNumber)
      : 1;
    const pageSize = Number.isInteger(Number(filters.pageSize))
      ? Number(filters.pageSize)
      : 10;
    const skip = (pageNumber - 1) * pageSize;
    const sort = { [sortBy]: sortDirection };
    const query = BlogModel.find({}, { _id: 0, __v: 0 });

    if (typeof filters.searchNameTerm === 'string' && filters.searchNameTerm) {
      query.where('name').regex(new RegExp(filters.searchNameTerm, 'i'));
    }

    const totalCount = await BlogModel.countDocuments(query.getFilter()).lean();
    const result = await query.sort(sort).skip(skip).limit(pageSize).lean();
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pageSize,
      pagesCount,
      totalCount,
      page: pageNumber,
      items: result,
    };
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  mapDBBlogToBlogViewModel: Blog.prototype.mapDBBlogToBlogViewModel,
};

type BlogModelStaticType = {
  setBlog: (dto: BlogDto, BlogModel: BlogModelType) => BlogDocument;
  filterBlogs: (
    filters: FiltersType,
    BlogModel: BlogModelType,
  ) => Promise<PaginationType<BlogViewModel>>;
};

const blogStaticMethods: BlogModelStaticType = {
  setBlog: Blog.setBlog,
  filterBlogs: Blog.filterBlogs,
};

BlogSchema.statics = blogStaticMethods;

export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & BlogModelStaticType;
