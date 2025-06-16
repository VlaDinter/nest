import { IPaginationParams } from '@src/features/base/interfaces/pagination-params.interface';

export class GetPostsByBlogIdCommand {
  constructor(
    public readonly params: IPaginationParams,
    public readonly userId?: string,
  ) {}
}
