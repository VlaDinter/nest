import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostViewModel } from '../../view-models/post-view-model';
import { PostDto } from '../../dto/post.dto';
import { BlogsService } from '../../../blogs/application/blogs.service';
import { PostsService } from '../posts.service';

export class EditPostWithBlogNameCommand {
  constructor(
    public readonly postId: string,
    public readonly updatePostDto: PostDto,
  ) {}
}

@CommandHandler(EditPostWithBlogNameCommand)
export class EditPostWithBlogNameUseCase
  implements ICommandHandler<EditPostWithBlogNameCommand>
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
