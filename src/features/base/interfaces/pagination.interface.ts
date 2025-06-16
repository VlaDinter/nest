export interface IPagination<T> {
  items: T[];
  page: number;
  pageSize: number;
  pagesCount: number;
  totalCount: number;
}
