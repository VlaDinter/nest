import { Game } from '../entities/game.entity';
import { Answer } from '../entities/answer.entity';
import { answerTimeoutMs } from '../constants/constants';
import { IGameStatus } from '../interfaces/game-status.interface';

export interface ITimedOutPlayers {
  finisherId: string;
  lateId: string;
}

const playerAnswers = (answers: Answer[], userId: string | null): Answer[] =>
  answers.filter((answer: Answer): boolean => answer.userId === userId);

export const countAnswers = (answers: Answer[], userId: string): number =>
  playerAnswers(answers, userId).length;

// The player who answered all questions first gets a bonus point
// if they have at least one correct answer.
export const finishGame = (game: Game, firstFinisherId: string): void => {
  game.status = IGameStatus.FINISHED;
  game.finishGameDate = new Date();

  if (firstFinisherId === game.firstPlayerId && game.firstPlayerScore > 0) {
    game.firstPlayerScore += 1;
  } else if (
    firstFinisherId === game.secondPlayerId &&
    game.secondPlayerScore > 0
  ) {
    game.secondPlayerScore += 1;
  }
};

// Returns the players of an active game where one player answered all
// questions more than `answerTimeoutMs` ago and the other one did not.
export const findTimedOutPlayers = (
  game: Game,
  questionsCount: number,
  answers: Answer[],
  now: number = Date.now(),
): ITimedOutPlayers | null => {
  if (
    game.status !== IGameStatus.ACTIVE ||
    !game.secondPlayerId ||
    !questionsCount
  ) {
    return null;
  }

  const players = [game.firstPlayerId, game.secondPlayerId];

  for (const [finisherId, lateId] of [players, [...players].reverse()]) {
    const finisherAnswers = playerAnswers(answers, finisherId);
    const lastAnswer = finisherAnswers[finisherAnswers.length - 1];

    if (
      finisherAnswers.length === questionsCount &&
      countAnswers(answers, lateId) < questionsCount &&
      now - new Date(lastAnswer.addedAt).getTime() >= answerTimeoutMs
    ) {
      return { finisherId, lateId };
    }
  }

  return null;
};
