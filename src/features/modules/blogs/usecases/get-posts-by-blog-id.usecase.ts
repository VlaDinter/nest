import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsService } from '../application/blogs.service';
import { PostsService } from '../../posts/application/posts.service';
import { PostViewModel } from '../../posts/models/output/post-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { GetPostsByBlogIdCommand } from './commands/get-posts-by-blog-id.command';

@CommandHandler(GetPostsByBlogIdCommand)
export class GetPostsByBlogIdUseCase
  implements ICommandHandler<GetPostsByBlogIdCommand>
{
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  async execute(
    command: GetPostsByBlogIdCommand,
  ): Promise<IPagination<PostViewModel> | null> {
    if (!command.params.blogId) {
      return null;
    }

    const foundBlog = await this.blogsService.getBlog(command.params.blogId);

    if (!foundBlog) {
      return null;
    }

    return this.postsService.getPosts(command.params, command.userId);
  }
}
