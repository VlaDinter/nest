import { CommentDto } from '../../../comments/dto/comment.dto';

export class AddCommentWithPostIdCommand {
  constructor(
    public readonly createCommentDto: CommentDto,
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}
