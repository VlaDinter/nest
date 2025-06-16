import { LikesInfoViewModel } from '@modules/comments/models/output/likes-info-view.model';
import { LikeDetailsViewModel } from '@modules/posts/models/output/like-details-view.model';
import { CommentatorInfoViewModel } from '@modules/comments/models/output/commentator-info-view.model';

export class CommentViewModel {
  id: string;
  postId?: string;
  content: string;
  createdAt: string;
  likesInfo: LikesInfoViewModel;
  likes?: LikeDetailsViewModel[];
  dislikes?: LikeDetailsViewModel[];
  commentatorInfo: CommentatorInfoViewModel;
}
