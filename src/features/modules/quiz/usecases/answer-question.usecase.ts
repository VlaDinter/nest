import { EntityManager } from 'typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Answer } from '../entities/answer.entity';
import { IGameStatus } from '../interfaces/game-status.interface';
import { IAnswerStatus } from '../interfaces/answer-status.interface';
import { AnswerViewModel } from '../models/output/answer-view.model';
import { AnswerQuestionCommand } from './commands/answer-question.command';
import { GamesTypeormRepository } from '../infrastructure/games.typeorm.repository';

const normalize = (value: string): string => value.trim().toLowerCase();

@CommandHandler(AnswerQuestionCommand)
export class AnswerQuestionUseCase
  implements ICommandHandler<AnswerQuestionCommand, AnswerViewModel | null>
{
  constructor(private readonly gamesRepository: GamesTypeormRepository) {}

  execute(command: AnswerQuestionCommand): Promise<AnswerViewModel | null> {
    return this.gamesRepository.transaction(
      async (manager: EntityManager): Promise<AnswerViewModel | null> => {
        // The row lock makes answers of both players in one game run one by one,
        // so the game is always finished exactly once.
        const game = await this.gamesRepository.findActiveGameForUpdate(
          command.userId,
          manager,
        );

        if (!game) {
          return null;
        }

        const gameQuestions = await this.gamesRepository.findGameQuestions(
          game.id,
          manager,
        );

        const answers = await this.gamesRepository.findAnswers(
          game.id,
          manager,
        );

        const isFirstPlayer = game.firstPlayerId === command.userId;

        const myAnswersCount = answers.filter(
          (answer: Answer): boolean => answer.userId === command.userId,
        ).length;

        if (myAnswersCount >= gameQuestions.length) {
          return null;
        }

        const { question } = gameQuestions[myAnswersCount];

        const isCorrect = question.correctAnswers.some(
          (correctAnswer: string): boolean =>
            normalize(correctAnswer) === normalize(command.answer),
        );

        const answer = await this.gamesRepository.createAnswer(
          {
            gameId: game.id,
            userId: command.userId,
            questionId: question.id,
            status: isCorrect ? IAnswerStatus.CORRECT : IAnswerStatus.INCORRECT,
          },
          manager,
        );

        if (isCorrect && isFirstPlayer) {
          game.firstPlayerScore += 1;
        } else if (isCorrect) {
          game.secondPlayerScore += 1;
        }

        const otherAnswersCount = answers.length - myAnswersCount;
        const isGameFinished =
          myAnswersCount + 1 === gameQuestions.length &&
          otherAnswersCount === gameQuestions.length;

        if (isGameFinished) {
          game.status = IGameStatus.FINISHED;
          game.finishGameDate = new Date();

          // The other player answered all questions first: bonus point
          // if they have at least one correct answer.
          if (isFirstPlayer && game.secondPlayerScore > 0) {
            game.secondPlayerScore += 1;
          } else if (!isFirstPlayer && game.firstPlayerScore > 0) {
            game.firstPlayerScore += 1;
          }
        }

        await this.gamesRepository.updateGame(game, manager);

        return {
          questionId: question.id,
          answerStatus: answer.status,
          addedAt: answer.addedAt.toISOString(),
        };
      },
    );
  }
}
