import { LikeDto } from '../dto/like.dto';
import { CommentDto } from '../dto/comment.dto';
import { CommentViewModel } from '../models/output/comment-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

export abstract class CommentsRepository {
  abstract findComments(
    params: IPaginationParams,
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
