import { Injectable } from '@nestjs/common';
import { GamePairViewModel } from '../models/output/game-pair-view.model';
import { GamesTypeormRepository } from '../infrastructure/games.typeorm.repository';

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

  async removeAll(): Promise<void> {
    await this.gamesRepository.deleteAll();
  }
}
