import { CommentViewModel } from '../view-models/comment-view-model';
import { IPagination } from '../../../interfaces/pagination.interface';
import { IFilters } from '../../../interfaces/filters.interface';
import { CommentDto } from '../dto/comment.dto';
import { LikeDto } from '../dto/like.dto';

export abstract class ICommentsRepository {
  abstract findComments(
    filters: IFilters,
    userId?: string,
  ): Promise<IPagination<CommentViewModel>>;
  abstract findComment(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewModel | null>;
  abstract createComment(
    createCommentDto: CommentDto,
    postId: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel>;
  abstract updateComment(
    commentId: string,
    updateCommentDto: CommentDto,
  ): Promise<CommentViewModel | null>;
  abstract updateLike(
    commentId: string,
    updateLikeDto: LikeDto,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel | null>;
  abstract deleteComment(commentId: string): Promise<CommentViewModel | null>;
  abstract deleteAll(): Promise<void>;
}
