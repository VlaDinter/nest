import { LikesInfoViewModel } from './likes-info-view.model';
import { CommentatorInfoViewModel } from './commentator-info-view.model';
import { LikeDetailsViewModel } from '../../../posts/models/output/like-details-view.model';

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
