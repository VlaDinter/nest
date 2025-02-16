import { Injectable } from '@nestjs/common';
import { CommentViewModel } from '../view-models/comment-view-model';
import { CommentsMongooseRepository } from '../infrastructure/mongo-repository/comments.mongoose.repository';
import { FiltersInterface } from '../../../interfaces/filters.interface';
import { PaginationInterface } from '../../../interfaces/pagination.interface';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsMongooseRepository,
  ) {}

  getComments(filters: FiltersInterface): Promise<PaginationInterface<CommentViewModel>> {
    return this.commentsRepository.findComments(filters);
  }

  getComment(commentId: string): Promise<CommentViewModel | null> {
    return this.commentsRepository.findComment(commentId);
  }

  async removeAll(): Promise<void> {
    await this.commentsRepository.deleteAll();
  }
}
