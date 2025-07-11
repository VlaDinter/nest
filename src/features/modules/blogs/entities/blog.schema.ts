import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogDto } from '../dto/blog.dto';
import { BlogViewModel } from '../models/output/blog-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';
import {
  nameConstraints,
  websiteUrlConstraints,
  descriptionConstraints,
} from '../constants/constants';

@Schema({ timestamps: true })
export class Blog {
  createdAt: string;

  @Prop({
    unique: true,
    type: String,
    default(): Types.ObjectId {
      return new Types.ObjectId();
    },
  })
  id: string;

  @Prop({
    type: String,
    required: true,
    ...nameConstraints,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    ...descriptionConstraints,
  })
  description: string;

  @Prop({
    type: String,
    required: true,
    ...websiteUrlConstraints,
  })
  websiteUrl: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isMembership: boolean;

  mapToViewModel(): BlogViewModel {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      websiteUrl: this.websiteUrl,
      description: this.description,
      isMembership: this.isMembership,
    };
  }

  static setBlog(dto: BlogDto): BlogDocument {
    const createdBlog = new this();

    createdBlog.name = dto.name;
    createdBlog.websiteUrl = dto.websiteUrl;
    createdBlog.description = dto.description;

    return createdBlog as BlogDocument;
  }

  static async paginated(
    params: IPaginationParams,
  ): Promise<IPagination<BlogViewModel>> {
    const BlogModel = this as BlogModelType;
    const skip = (params.pageNumber - 1) * params.pageSize;
    const sort = { [params.sortBy]: params.sortDirection };
    const query = BlogModel.find();

    if (params.searchNameTerm) {
      query.where('name').regex(new RegExp(params.searchNameTerm, 'i'));
    }

    const totalCount = await BlogModel.countDocuments(query.getFilter()).lean();
    const result = await query
      .sort(sort)
      .skip(skip)
      .limit(params.pageSize)
      .exec();

    const pagesCount = Math.ceil(totalCount / params.pageSize);

    return {
      totalCount,
      pagesCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      items: result.map(
        (blog: BlogDocument): BlogViewModel => blog.mapToViewModel(),
      ),
    };
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & typeof Blog;
