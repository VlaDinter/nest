import { EntityManager } from 'typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { gameQuestionsCount } from '../constants/constants';
import { ConnectToGameCommand } from './commands/connect-to-game.command';
import { GamePairViewModel } from '../models/output/game-pair-view.model';
import { GameTimeoutService } from '../application/game-timeout.service';
import { GamesTypeormRepository } from '../infrastructure/games.typeorm.repository';
import { QuestionsTypeormRepository } from '../infrastructure/questions.typeorm.repository';

@CommandHandler(ConnectToGameCommand)
export class ConnectToGameUseCase
  implements ICommandHandler<ConnectToGameCommand, GamePairViewModel | null>
{
  constructor(
    private readonly gamesRepository: GamesTypeormRepository,
    private readonly questionsRepository: QuestionsTypeormRepository,
    private readonly gameTimeoutService: GameTimeoutService,
  ) {}

  async execute(
    command: ConnectToGameCommand,
  ): Promise<GamePairViewModel | null> {
    // A player whose game timed out must be able to start a new one.
    await this.gameTimeoutService.finishTimedOutGames();

    const gameId = await this.gamesRepository.transaction(
      async (manager: EntityManager): Promise<string | null> => {
        // Serializes connections so two users can't both open a pending game
        // or join the same one at the same time.
        await this.gamesRepository.lockConnections(manager);

        const unfinishedGame = await this.gamesRepository.findUnfinishedGame(
          command.userId,
          manager,
        );

        if (unfinishedGame) {
          return null;
        }

        const pendingGame = await this.gamesRepository.findPendingGame(manager);

        if (!pendingGame) {
          const game = await this.gamesRepository.createGame(
            command.userId,
            manager,
          );

          return game.id;
        }

        const questions =
          await this.questionsRepository.findRandomPublishedQuestions(
            gameQuestionsCount,
            manager,
          );

        await this.gamesRepository.startGame(
          pendingGame.id,
          command.userId,
          questions,
          manager,
        );

        return pendingGame.id;
      },
    );

    return gameId ? this.gamesRepository.findGameView(gameId) : null;
  }
}
