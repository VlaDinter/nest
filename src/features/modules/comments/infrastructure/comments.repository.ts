import { LikeDto } from '@modules/comments/dto/like.dto';
import { CommentDto } from '@modules/comments/dto/comment.dto';
import { IPagination } from '@src/features/base/interfaces/pagination.interface';
import { CommentViewModel } from '@modules/comments/models/output/comment-view.model';
import { IPaginationParams } from '@src/features/base/interfaces/pagination-params.interface';

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
