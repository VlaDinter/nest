import { CommentatorInfoViewModel } from './commentator-info-view-model';
import { LikesInfoViewModel } from './likes-info-view-model';

export class CommentViewModel {
  id: string;
  content: string;
  createdAt: string;
  commentatorInfo: CommentatorInfoViewModel;
  likesInfo: LikesInfoViewModel;
}
