import { IPublishedStatus } from './published-status.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

export interface IQuestionsPaginationParams extends IPaginationParams {
  bodySearchTerm?: string;
  publishedStatus: IPublishedStatus;
}
