import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IFilters } from '../../../../interfaces/filters.interface';
import { IPagination } from '../../../../interfaces/pagination.interface';
import { BlogsService } from '../blogs.service';
import { PostsService } from '../../../posts/application/posts.service';
import { PostViewModel } from '../../../posts/view-models/post-view-model';

export class GetPostsByBlogIdCommand {
  constructor(
    public readonly filters: IFilters,
    public readonly userId?: string,
  ) {}
}

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
    if (!command.filters.blogId) {
      return null;
    }

    const foundBlog = await this.blogsService.getBlog(command.filters.blogId);

    if (!foundBlog) {
      return null;
    }

    return this.postsService.getPosts(command.filters, command.userId);
  }
}
