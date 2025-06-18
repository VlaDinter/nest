import { PostDto } from '../../dto/post.dto';

export class EditPostWithBlogNameCommand {
  constructor(
    public readonly postId: string,
    public readonly updatePostDto: PostDto,
  ) {}
}
