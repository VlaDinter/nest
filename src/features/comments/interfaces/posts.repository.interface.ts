import { CommentViewModel } from '../view-models/comment-view-model';
import { PaginationInterface } from '../../../interfaces/pagination.interface';
import { FiltersInterface } from '../../../interfaces/filters.interface';

export abstract class ICommentsRepository {
  abstract findComments(
    filters: FiltersInterface,
  ): Promise<PaginationInterface<CommentViewModel>>;
  abstract findComment(commentId: string): Promise<CommentViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
