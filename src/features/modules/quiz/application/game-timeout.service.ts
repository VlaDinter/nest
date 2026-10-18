import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Game } from '../entities/game.entity';
import { Answer } from '../entities/answer.entity';
import { answerTimeoutMs } from '../constants/constants';
import { GameQuestion } from '../entities/game-question.entity';
import { IAnswerStatus } from '../interfaces/answer-status.interface';
import { GamesTypeormRepository } from '../infrastructure/games.typeorm.repository';
import {
  finishGame,
  countAnswers,
  findTimedOutPlayers,
} from '../utils/game-rules';

// Games are finished lazily: every quiz request first closes the games whose
// 10 seconds are over, so the API never shows an expired game as active.
@Injectable()
export class GameTimeoutService {
  constructor(private readonly gamesRepository: GamesTypeormRepository) {}

  async finishTimedOutGames(): Promise<void> {
    const gameIds = await this.gamesRepository.findTimedOutGameIds(
      new Date(Date.now() - answerTimeoutMs),
    );

    for (const gameId of gameIds) {
      await this.gamesRepository.transaction(
        async (manager: EntityManager): Promise<void> => {
          const game = await this.gamesRepository.findActiveGameByIdForUpdate(
            gameId,
            manager,
          );

          if (!game) {
            return;
          }

          const [gameQuestions, answers] = await Promise.all([
            this.gamesRepository.findGameQuestions(gameId, manager),
            this.gamesRepository.findAnswers(gameId, manager),
          ]);

          await this.finishIfTimedOut(game, gameQuestions, answers, manager);
        },
      );
    }
  }

  // The game row must be locked by the caller. Unanswered questions of the
  // late player are saved as incorrect answers.
  async finishIfTimedOut(
    game: Game,
    gameQuestions: GameQuestion[],
    answers: Answer[],
    manager: EntityManager,
  ): Promise<boolean> {
    const players = findTimedOutPlayers(game, gameQuestions.length, answers);

    if (!players) {
      return false;
    }

    const missingQuestions = gameQuestions.slice(
      countAnswers(answers, players.lateId),
    );

    await this.gamesRepository.createAnswers(
      missingQuestions.map(({ questionId }: GameQuestion) => ({
        questionId,
        gameId: game.id,
        userId: players.lateId,
        status: IAnswerStatus.INCORRECT,
      })),
      manager,
    );

    finishGame(game, players.finisherId);

    await this.gamesRepository.updateGame(game, manager);

    return true;
  }
}
