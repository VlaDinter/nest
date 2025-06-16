import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsService } from '@modules/blogs/application/blogs.service';
import { PostsService } from '@modules/posts/application/posts.service';
import { PostViewModel } from '@modules/posts/models/output/post-view.model';
import { EditPostWithBlogNameCommand } from '@modules/posts/usecases/commands/edit-post-with-blog-name.command';

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
