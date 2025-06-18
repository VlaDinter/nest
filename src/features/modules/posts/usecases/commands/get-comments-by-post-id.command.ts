import { IPaginationParams } from '../../../../base/interfaces/pagination-params.interface';

export class GetCommentsByPostIdCommand {
  constructor(
    public readonly params: IPaginationParams,
    public readonly userId?: string,
  ) {}
}
