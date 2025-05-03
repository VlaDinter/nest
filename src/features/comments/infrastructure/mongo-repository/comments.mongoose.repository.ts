import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ICommentsRepository } from '../../interfaces/posts.repository.interface';
import { Comment, CommentModelType } from '../../entities/comment.schema';
import { CommentViewModel } from '../../view-models/comment-view-model';
import { IPagination } from '../../../../interfaces/pagination.interface';
import { IFilters } from '../../../../interfaces/filters.interface';

@Injectable()
export class CommentsMongooseRepository extends ICommentsRepository {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
  ) {
    super();
  }

  findComments(filters: IFilters): Promise<IPagination<CommentViewModel>> {
    return this.CommentModel.filterComments(this.CommentModel, filters);
  }

  async findComment(commentId: string): Promise<CommentViewModel | null> {
    const commentInstance = await this.CommentModel.findOne({
      id: commentId,
    }).exec();

    if (!commentInstance) {
      return commentInstance;
    }

    return commentInstance.mapDBCommentToCommentViewModel();
  }

  async deleteAll(): Promise<void> {
    await this.CommentModel.deleteMany();
  }
}
