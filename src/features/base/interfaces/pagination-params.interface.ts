import { ISortDirections } from './sort-directions.interface';

export interface IPaginationParams {
  sortBy: string;
  blogId?: string;
  postId?: string;
  pageSize: number;
  pageNumber: number;
  searchNameTerm?: string;
  searchEmailTerm?: string;
  searchLoginTerm?: string;
  sortDirection: ISortDirections;
}
