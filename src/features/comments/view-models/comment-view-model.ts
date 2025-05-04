import { CommentatorInfoViewModel } from './commentator-info-view-model';
import { LikesInfoViewModel } from './likes-info-view-model';
import { LikeDetailsViewModel } from '../../posts/view-models/like-details-view-model';

export class CommentViewModel {
  id: string;
  postId?: string;
  content: string;
  createdAt: string;
  commentatorInfo: CommentatorInfoViewModel;
  likesInfo: LikesInfoViewModel;
  likes?: LikeDetailsViewModel[];
  dislikes?: LikeDetailsViewModel[];
}
