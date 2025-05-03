import { CommentViewModel } from '../view-models/comment-view-model';
import { IPagination } from '../../../interfaces/pagination.interface';
import { IFilters } from '../../../interfaces/filters.interface';

export abstract class ICommentsRepository {
  abstract findComments(
    filters: IFilters,
  ): Promise<IPagination<CommentViewModel>>;
  abstract findComment(commentId: string): Promise<CommentViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
