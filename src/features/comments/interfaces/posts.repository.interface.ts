import { CommentViewModel } from '../view-models/comment-view-model';
import { FiltersType } from '../../../types/FiltersType';
import { PaginationType } from '../../../types/PaginationType';

export abstract class ICommentsRepository {
  abstract findComments(
    filters: FiltersType,
  ): Promise<PaginationType<CommentViewModel>>;
  abstract findComment(commentId: string): Promise<CommentViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
