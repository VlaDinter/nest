import { LikeDto } from '../../../comments/dto/like.dto';

export class EditPostWithUserLoginCommand {
  constructor(
    public readonly postId: string,
    public readonly updateLikeDto: LikeDto,
    public readonly userId: string,
  ) {}
}
