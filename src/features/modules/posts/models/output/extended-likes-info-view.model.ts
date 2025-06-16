import { LikeDetailsViewModel } from '@modules/posts/models/output/like-details-view.model';

export class ExtendedLikesInfoViewModel {
  myStatus: string;
  likesCount: number;
  dislikesCount: number;
  newestLikes: LikeDetailsViewModel[];
}
