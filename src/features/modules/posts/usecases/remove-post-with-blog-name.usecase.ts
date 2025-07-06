import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../application/posts.service';
import { PostViewModel } from '../models/output/post-view.model';
import { BlogsService } from '../../blogs/application/blogs.service';
import { RemovePostWithBlogNameCommand } from './commands/remove-post-with-blog-name.command';

@CommandHandler(RemovePostWithBlogNameCommand)
export class RemovePostWithBlogNameUseCase
  implements
    ICommandHandler<RemovePostWithBlogNameCommand, PostViewModel | null>
{
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  async execute(
    command: RemovePostWithBlogNameCommand,
  ): Promise<PostViewModel | null> {
    const blog = await this.blogsService.getBlog(command.blogId);

    if (!blog) {
      return null;
    }

    return this.postsService.removePost(command.postId);
  }
}
