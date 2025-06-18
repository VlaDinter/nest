import { PostDto } from '../../dto/post.dto';

export class AddPostWithBlogNameCommand {
  constructor(public readonly createPostDto: PostDto) {}
}
