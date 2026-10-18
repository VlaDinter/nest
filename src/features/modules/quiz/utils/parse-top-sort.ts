import { ISortDirections } from '../../../base/interfaces/sort-directions.interface';

export const topSortFields = [
  'sumScore',
  'avgScores',
  'gamesCount',
  'winsCount',
  'lossesCount',
  'drawsCount',
] as const;

export type TopSortField = (typeof topSortFields)[number];

export interface ITopSort {
  field: TopSortField;
  direction: ISortDirections;
}

export const defaultTopSort = ['avgScores desc', 'sumScore desc'];

const parseItem = (item: unknown): ITopSort | null => {
  if (typeof item !== 'string') {
    return null;
  }

  const [field, direction = ISortDirections.DESC] = item.trim().split(/\s+/);
  const normalizedDirection = direction.toLowerCase() as ISortDirections;

  if (
    !topSortFields.includes(field as TopSortField) ||
    !Object.values(ISortDirections).includes(normalizedDirection)
  ) {
    return null;
  }

  return { field: field as TopSortField, direction: normalizedDirection };
};

// `sort` comes from the query as one string or an array of strings like
// "avgScores desc". Unknown fields and duplicates are skipped.
export const parseTopSort = (sort: unknown): ITopSort[] => {
  const items = Array.isArray(sort) ? sort : [sort];
  const result: ITopSort[] = [];

  items.map(parseItem).forEach((item: ITopSort | null): void => {
    if (item && !result.some(({ field }) => field === item.field)) {
      result.push(item);
    }
  });

  return result.length ? result : parseTopSort(defaultTopSort);
};
