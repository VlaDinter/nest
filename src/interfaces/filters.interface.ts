import { SortOrder } from 'mongoose';

export interface FiltersInterface {
  searchEmailTerm: string;
  searchLoginTerm: string;
  searchNameTerm: string;
  sortDirection: SortOrder;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
}
