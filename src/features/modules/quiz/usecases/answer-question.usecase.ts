import { EntityManager } from 'typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { countAnswers, finishGame } from '../utils/game-rules';
import { IAnswerStatus } from '../interfaces/answer-status.interface';
import { AnswerViewModel } from '../models/output/answer-view.model';
import { AnswerQuestionCommand } from './commands/answer-question.command';
import { GameTimeoutService } from '../application/game-timeout.service';
import { GamesTypeormRepository } from '../infrastructure/games.typeorm.repository';

const normalize = (value: string): string => value.trim().toLowerCase();

@CommandHandler(AnswerQuestionCommand)
export class AnswerQuestionUseCase
  implements ICommandHandler<AnswerQuestionCommand, AnswerViewModel | null>
{
  constructor(
    private readonly gamesRepository: GamesTypeormRepository,
    private readonly gameTimeoutService: GameTimeoutService,
  ) {}

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

        // Too late: the opponent finished more than 10 seconds ago.
        const isTimedOut = await this.gameTimeoutService.finishIfTimedOut(
          game,
          gameQuestions,
          answers,
          manager,
        );

        const myAnswersCount = countAnswers(answers, command.userId);

        if (isTimedOut || myAnswersCount >= gameQuestions.length) {
          return null;
        }

        const isFirstPlayer = game.firstPlayerId === command.userId;
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
          const opponentId = isFirstPlayer
            ? game.secondPlayerId
            : game.firstPlayerId;

          finishGame(game, opponentId as string);
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
