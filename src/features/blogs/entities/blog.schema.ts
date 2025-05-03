import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogViewModel } from '../view-models/blog-view-model';
import { BlogDto } from '../dto/blog.dto';
import { IPagination } from '../../../interfaces/pagination.interface';
import { IFilters } from '../../../interfaces/filters.interface';
import { ISortDirections } from '../../../interfaces/sort-directions.interface';

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
    default: false,
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

  static setBlog(BlogModel: BlogModelType, dto: BlogDto): BlogDocument {
    const createdBlog = new BlogModel({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    return createdBlog;
  }

  static async filterBlogs(
    BlogModel: BlogModelType,
    filters: IFilters,
  ): Promise<IPagination<BlogViewModel>> {
    const searchNameTerm = filters.searchNameTerm;
    const sortBy = filters.sortBy;
    const sortDirection =
      filters.sortDirection === ISortDirections.ASC
        ? ISortDirections.ASC
        : ISortDirections.DESC;
    const pageSize = filters.pageSize > 0 ? filters.pageSize : 10;
    const pageNumber = filters.pageNumber > 0 ? filters.pageNumber : 1;
    const skip = (pageNumber - 1) * pageSize;
    const sort = !sortBy ? {} : { [sortBy]: sortDirection };
    const query = BlogModel.find({}, { _id: 0, __v: 0 });

    if (searchNameTerm) {
      query.where('name').regex(new RegExp(searchNameTerm, 'i'));
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
  setBlog: (BlogModel: BlogModelType, dto: BlogDto) => BlogDocument;
  filterBlogs: (
    BlogModel: BlogModelType,
    filters: IFilters,
  ) => Promise<IPagination<BlogViewModel>>;
};

const blogStaticMethods: BlogModelStaticType = {
  setBlog: Blog.setBlog,
  filterBlogs: Blog.filterBlogs,
};

BlogSchema.statics = blogStaticMethods;

export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & BlogModelStaticType;
