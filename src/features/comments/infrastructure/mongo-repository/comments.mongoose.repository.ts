import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ICommentsRepository } from '../../interfaces/posts.repository.interface';
import { Comment, CommentModelType } from '../../entities/comment.schema';
import { CommentViewModel } from '../../view-models/comment-view-model';
import { FiltersType } from '../../../../types/FiltersType';
import { PaginationType } from '../../../../types/PaginationType';

@Injectable()
export class CommentsMongooseRepository extends ICommentsRepository {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
  ) {
    super();
  }

  findComments(
    filters: FiltersType,
  ): Promise<PaginationType<CommentViewModel>> {
    return this.CommentModel.filterComments(filters, this.CommentModel);
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