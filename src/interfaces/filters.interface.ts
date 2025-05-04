import { ISortDirections } from './sort-directions.interface';

export interface IFilters {
  blogId?: string;
  postId?: string;
  searchEmailTerm?: string;
  searchLoginTerm?: string;
  searchNameTerm?: string;
  sortDirection: ISortDirections;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
}
