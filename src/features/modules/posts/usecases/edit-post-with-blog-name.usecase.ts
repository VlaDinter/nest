import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../application/posts.service';
import { PostViewModel } from '../models/output/post-view.model';
import { BlogsService } from '../../blogs/application/blogs.service';
import { EditPostWithBlogNameCommand } from './commands/edit-post-with-blog-name.command';

@CommandHandler(EditPostWithBlogNameCommand)
export class EditPostWithBlogNameUseCase
  implements ICommandHandler<EditPostWithBlogNameCommand, PostViewModel | null>
{
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  async execute(
    command: EditPostWithBlogNameCommand,
  ): Promise<PostViewModel | null> {
    const blog = await this.blogsService.getBlog(command.updatePostDto.blogId);

    if (!blog) {
      return null;
    }

    return this.postsService.editPost(
      command.postId,
      command.updatePostDto,
      blog.name,
    );
  }
}
