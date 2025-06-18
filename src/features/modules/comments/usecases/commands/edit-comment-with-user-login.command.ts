import { LikeDto } from '../../dto/like.dto';

export class EditCommentWithUserLoginCommand {
  constructor(
    public readonly commentId: string,
    public readonly updateLikeDto: LikeDto,
    public readonly userId: string,
  ) {}
}
