import { ExtendedLikesInfoViewModel } from './extended-likes-info-view-model';
import { LikeDetailsViewModel } from './like-details-view-model';

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
  likes?: LikeDetailsViewModel[];
  dislikes?: LikeDetailsViewModel[];
}
