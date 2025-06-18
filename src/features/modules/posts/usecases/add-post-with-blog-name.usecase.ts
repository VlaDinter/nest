import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../application/posts.service';
import { PostViewModel } from '../models/output/post-view.model';
import { BlogsService } from '../../blogs/application/blogs.service';
import { AddPostWithBlogNameCommand } from './commands/add-post-with-blog-name.command';

@CommandHandler(AddPostWithBlogNameCommand)
export class AddPostWithBlogNameUseCase
  implements ICommandHandler<AddPostWithBlogNameCommand, PostViewModel | null>
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
