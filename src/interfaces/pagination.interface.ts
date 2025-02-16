export interface PaginationInterface<T> {
  totalCount: number;
  pagesCount: number;
  pageSize: number;
  page: number;
  items: T[];
}
