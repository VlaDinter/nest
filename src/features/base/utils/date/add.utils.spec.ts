import { Add } from './add.utils';

describe('add', () => {
  it('1 - Correct add month', () => {
    const date = new Date(2023, 5, 3);
    const expectDate = new Date(2023, 7, 3);
    const result = Add.month(date, 2);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('2 - Correct add month', () => {
    const date = new Date(2023, 5, 3);
    const expectDate = new Date(2025, 1, 3);
    const result = Add.month(date, 20);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('3 - Correct add month', () => {
    const date = new Date(2023, 5, 3);
    const expectDate = new Date(2023, 3, 3);
    const result = Add.month(date, -2);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('4 - Correct add days', () => {
    const date = new Date(2023, 5, 3);
    const expectDate = new Date(2023, 5, 5);
    const result = Add.days(date, 2);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('5 - Correct add days', () => {
    const date = new Date(2023, 5, 3);
    const expectDate = new Date(2023, 6, 23);
    const result = Add.days(date, 50);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('6 - Correct add days', () => {
    const date = new Date(2023, 5, 3);
    const expectDate = new Date(2023, 5, 1);
    const result = Add.days(date, -2);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('7 - Correct add hours', () => {
    const date = new Date(2023, 5, 3, 10, 0);
    const expectDate = new Date(2023, 5, 3, 12, 0);
    const result = Add.hours(date, 2);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('8 - Correct add hours', () => {
    const date = new Date(2023, 5, 3, 10, 0);
    const expectDate = new Date(2023, 5, 4, 16, 0);
    const result = Add.hours(date, 30);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('9 - Correct add hours', () => {
    const date = new Date(2023, 5, 3, 10, 0);
    const expectDate = new Date(2023, 5, 3, 8, 0);
    const result = Add.hours(date, -2);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('10 - Correct add minutes', () => {
    const date = new Date(2023, 5, 3, 10, 0);
    const expectDate = new Date(2023, 5, 3, 10, 2);
    const result = Add.minutes(date, 2);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('11 - Correct add minutes', () => {
    const date = new Date(2023, 5, 3, 10, 0);
    const expectDate = new Date(2023, 5, 5, 10, 20);
    const result = Add.minutes(date, 2900);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('12 - Correct add minutes', () => {
    const date = new Date(2023, 5, 3, 10, 0);
    const expectDate = new Date(2023, 5, 3, 9, 58);
    const result = Add.minutes(date, -2);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('13 - Correct add seconds', () => {
    const date = new Date(2023, 5, 3, 10, 0, 0);
    const expectDate = new Date(2023, 5, 3, 10, 0, 2);
    const result = Add.seconds(date, 2);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('14 - Correct add seconds', () => {
    const date = new Date(2023, 5, 3, 10, 0, 0);
    const expectDate = new Date(2023, 5, 3, 11, 23, 21);
    const result = Add.seconds(date, 5001);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('15 - Correct add seconds', () => {
    const date = new Date(2023, 5, 3, 10, 0, 0);
    const expectDate = new Date(2023, 5, 3, 9, 59, 58);
    const result = Add.seconds(date, -2);

    expect(result.toString()).toBe(expectDate.toString());
  });

  it('16 - Correct add seconds', () => {
    const date = new Date(2023, 5, 3, 10, 0, 0);
    const expectDate = new Date(2023, 5, 3, 9, 59, 58);
    const result = Add.seconds(date, -2);

    expect(result.toString()).toBe(expectDate.toString());
  });
});
