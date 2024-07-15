import { SortOrder } from 'mongoose';

export type FiltersType = {
  searchEmailTerm: string;
  searchLoginTerm: string;
  searchNameTerm: string;
  sortDirection: SortOrder;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
};
