import { ISortDirections } from './sort-directions.interface';

export interface IFilters {
  searchEmailTerm?: string;
  searchLoginTerm?: string;
  searchNameTerm?: string;
  sortDirection: ISortDirections;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
}
