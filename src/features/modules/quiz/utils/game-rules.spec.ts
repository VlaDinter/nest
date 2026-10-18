import { Game } from '../entities/game.entity';
import { Answer } from '../entities/answer.entity';
import { IGameStatus } from '../interfaces/game-status.interface';
import { IAnswerStatus } from '../interfaces/answer-status.interface';
import { finishGame, findTimedOutPlayers } from './game-rules';

const NOW = new Date('2026-10-18T12:00:00.000Z').getTime();

const makeGame = (overrides: Partial<Game> = {}): Game =>
  Object.assign(new Game(), {
    id: 'game',
    status: IGameStatus.ACTIVE,
    firstPlayerId: 'p1',
    secondPlayerId: 'p2',
    firstPlayerScore: 0,
    secondPlayerScore: 0,
    finishGameDate: null,
    ...overrides,
  });

let nextId = 1;

const makeAnswers = (userId: string, count: number, secondsAgo: number) =>
  Array.from({ length: count }, () =>
    Object.assign(new Answer(), {
      id: nextId++,
      userId,
      status: IAnswerStatus.CORRECT,
      addedAt: new Date(NOW - secondsAgo * 1000),
    }),
  );

describe('findTimedOutPlayers', () => {
  it('1 - Finds the late player 10 seconds after the other one finished', () => {
    const answers = [...makeAnswers('p1', 5, 10), ...makeAnswers('p2', 2, 12)];

    expect(findTimedOutPlayers(makeGame(), 5, answers, NOW)).toEqual({
      finisherId: 'p1',
      lateId: 'p2',
    });
  });

  it('2 - Waits while less than 10 seconds have passed', () => {
    const answers = [...makeAnswers('p1', 5, 9), ...makeAnswers('p2', 2, 12)];

    expect(findTimedOutPlayers(makeGame(), 5, answers, NOW)).toBeNull();
  });

  it('3 - Works when the second player finished first', () => {
    const answers = [...makeAnswers('p2', 5, 30), ...makeAnswers('p1', 0, 0)];

    expect(findTimedOutPlayers(makeGame(), 5, answers, NOW)).toEqual({
      finisherId: 'p2',
      lateId: 'p1',
    });
  });

  it('4 - Ignores games where nobody answered all questions', () => {
    const answers = [...makeAnswers('p1', 4, 60), ...makeAnswers('p2', 3, 60)];

    expect(findTimedOutPlayers(makeGame(), 5, answers, NOW)).toBeNull();
  });

  it('5 - Ignores games that are not active', () => {
    const game = makeGame({ status: IGameStatus.FINISHED });

    expect(findTimedOutPlayers(game, 5, makeAnswers('p1', 5, 60), NOW)).toBe(
      null,
    );
  });
});

describe('finishGame', () => {
  it('6 - Gives a bonus to the first finisher with a correct answer', () => {
    const game = makeGame({ firstPlayerScore: 2, secondPlayerScore: 3 });

    finishGame(game, 'p1');

    expect(game.status).toBe(IGameStatus.FINISHED);
    expect(game.finishGameDate).toBeInstanceOf(Date);
    expect([game.firstPlayerScore, game.secondPlayerScore]).toEqual([3, 3]);
  });

  it('7 - Gives no bonus without correct answers', () => {
    const game = makeGame({ firstPlayerScore: 0, secondPlayerScore: 1 });

    finishGame(game, 'p1');

    expect([game.firstPlayerScore, game.secondPlayerScore]).toEqual([0, 1]);
  });
});
