import { Injectable } from '@nestjs/common';
import { Game } from '../entities/game.entity';
import { GamePairViewModel } from '../models/output/game-pair-view.model';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { MyStatisticViewModel } from '../models/output/my-statistic-view.model';
import { GamesTypeormRepository } from '../infrastructure/games.typeorm.repository';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';

@Injectable()
export class GamesService {
  constructor(private readonly gamesRepository: GamesTypeormRepository) {}

  async getCurrentGame(userId: string): Promise<GamePairViewModel | null> {
    const game = await this.gamesRepository.findUnfinishedGame(userId);

    return game ? this.gamesRepository.findGameView(game.id) : null;
  }

  getGame(gameId: string): Promise<GamePairViewModel | null> {
    return this.gamesRepository.findGameView(gameId);
  }

  getUserGames(
    userId: string,
    params: IPaginationParams,
  ): Promise<IPagination<GamePairViewModel>> {
    return this.gamesRepository.findUserGames(userId, params);
  }

  async getUserStatistic(userId: string): Promise<MyStatisticViewModel> {
    const games = await this.gamesRepository.findFinishedUserGames(userId);

    const statistic: MyStatisticViewModel = {
      sumScore: 0,
      avgScores: 0,
      gamesCount: games.length,
      winsCount: 0,
      lossesCount: 0,
      drawsCount: 0,
    };

    games.forEach((game: Game): void => {
      const isFirstPlayer = game.firstPlayerId === userId;
      const myScore = isFirstPlayer
        ? game.firstPlayerScore
        : game.secondPlayerScore;
      const opponentScore = isFirstPlayer
        ? game.secondPlayerScore
        : game.firstPlayerScore;

      statistic.sumScore += myScore;

      if (myScore > opponentScore) {
        statistic.winsCount += 1;
      } else if (myScore < opponentScore) {
        statistic.lossesCount += 1;
      } else {
        statistic.drawsCount += 1;
      }
    });

    if (statistic.gamesCount) {
      statistic.avgScores =
        Math.round((statistic.sumScore / statistic.gamesCount) * 100) / 100;
    }

    return statistic;
  }

  async removeAll(): Promise<void> {
    await this.gamesRepository.deleteAll();
  }
}
