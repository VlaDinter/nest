import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostViewModel } from '../../view-models/post-view-model';
import { PostDto } from '../../dto/post.dto';
import { BlogsService } from '../../../blogs/application/blogs.service';
import { PostsService } from '../posts.service';

export class AddPostWithBlogNameCommand {
  constructor(public readonly createPostDto: PostDto) {}
}

@CommandHandler(AddPostWithBlogNameCommand)
export class AddPostWithBlogNameUseCase
  implements ICommandHandler<AddPostWithBlogNameCommand>
{
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  async execute(
    command: AddPostWithBlogNameCommand,
  ): Promise<PostViewModel | null> {
    const blog = await this.blogsService.getBlog(command.createPostDto.blogId);

    if (!blog) {
      return null;
    }

    return this.postsService.addPost(command.createPostDto, blog.name);
  }
}
