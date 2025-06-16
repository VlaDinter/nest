import { LikeDetailsViewModel } from '@modules/posts/models/output/like-details-view.model';
import { ExtendedLikesInfoViewModel } from '@modules/posts/models/output/extended-likes-info-view.model';

export class PostViewModel {
  id: string;
  title: string;
  blogId: string;
  content: string;
  blogName: string;
  createdAt: string;
  shortDescription: string;
  likes?: LikeDetailsViewModel[];
  dislikes?: LikeDetailsViewModel[];
  extendedLikesInfo: ExtendedLikesInfoViewModel;
}
