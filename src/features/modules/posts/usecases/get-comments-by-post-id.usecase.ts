import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '@modules/posts/application/posts.service';
import { IPagination } from '@src/features/base/interfaces/pagination.interface';
import { CommentsService } from '@modules/comments/application/comments.service';
import { CommentViewModel } from '@modules/comments/models/output/comment-view.model';
import { GetCommentsByPostIdCommand } from '@modules/posts/usecases/commands/get-comments-by-post-id.command';

@CommandHandler(GetCommentsByPostIdCommand)
export class GetCommentsByPostIdUseCase
  implements
    ICommandHandler<
      GetCommentsByPostIdCommand,
      IPagination<CommentViewModel> | null
    >
{
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  async execute(
    command: GetCommentsByPostIdCommand,
  ): Promise<IPagination<CommentViewModel> | null> {
    if (!command.params.postId) {
      return null;
    }

    const foundPost = await this.postsService.getPost(command.params.postId);

    if (!foundPost) {
      return null;
    }

    return this.commentsService.getComments(command.params, command.userId);
  }
}
