export type PaginationType<T> = {
  totalCount: number;
  pagesCount: number;
  pageSize: number;
  page: number;
  items: T[];
};
