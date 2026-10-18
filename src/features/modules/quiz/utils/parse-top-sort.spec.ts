import { parseTopSort } from './parse-top-sort';

describe('parseTopSort', () => {
  it('1 - Uses default sort when nothing is passed', () => {
    expect(parseTopSort(undefined)).toEqual([
      { field: 'avgScores', direction: 'desc' },
      { field: 'sumScore', direction: 'desc' },
    ]);
  });

  it('2 - Parses one string value', () => {
    expect(parseTopSort('winsCount asc')).toEqual([
      { field: 'winsCount', direction: 'asc' },
    ]);
  });

  it('3 - Parses an array in the given order', () => {
    expect(
      parseTopSort([
        'avgScores desc',
        'sumScore desc',
        'winsCount desc',
        'lossesCount asc',
      ]),
    ).toEqual([
      { field: 'avgScores', direction: 'desc' },
      { field: 'sumScore', direction: 'desc' },
      { field: 'winsCount', direction: 'desc' },
      { field: 'lossesCount', direction: 'asc' },
    ]);
  });

  it('4 - Skips unknown fields, bad directions and duplicates', () => {
    expect(
      parseTopSort([
        'password desc',
        'drawsCount sideways',
        'gamesCount ASC',
        'gamesCount desc',
      ]),
    ).toEqual([{ field: 'gamesCount', direction: 'asc' }]);
  });

  it('5 - Falls back to default when every value is invalid', () => {
    expect(parseTopSort(['id; DROP TABLE "Users"'])).toEqual(
      parseTopSort(undefined),
    );
  });

  it('6 - Uses desc when direction is missing', () => {
    expect(parseTopSort('sumScore')).toEqual([
      { field: 'sumScore', direction: 'desc' },
    ]);
  });
});
