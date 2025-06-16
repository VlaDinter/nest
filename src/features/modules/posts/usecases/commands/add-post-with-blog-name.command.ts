import { PostDto } from '@modules/posts/dto/post.dto';

export class AddPostWithBlogNameCommand {
  constructor(public readonly createPostDto: PostDto) {}
}
