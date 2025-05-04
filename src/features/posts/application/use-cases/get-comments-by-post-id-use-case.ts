import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../posts.service';
import { CommentViewModel } from '../../../comments/view-models/comment-view-model';
import { CommentsService } from '../../../comments/application/comments.service';
import { IFilters } from '../../../../interfaces/filters.interface';
import { IPagination } from '../../../../interfaces/pagination.interface';

export class GetCommentsByPostIdCommand {
  constructor(
    public readonly filters: IFilters,
    public readonly userId?: string,
  ) {}
}

@CommandHandler(GetCommentsByPostIdCommand)
export class GetCommentsByPostIdUseCase
  implements ICommandHandler<GetCommentsByPostIdCommand>
{
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}

  async execute(
    command: GetCommentsByPostIdCommand,
  ): Promise<IPagination<CommentViewModel> | null> {
    if (!command.filters.postId) {
      return null;
    }

    const foundPost = await this.postsService.getPost(command.filters.postId);

    if (!foundPost) {
      return null;
    }

    return this.commentsService.getComments(command.filters, command.userId);
  }
}
