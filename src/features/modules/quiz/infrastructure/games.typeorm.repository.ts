import { Injectable } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Game } from '../entities/game.entity';
import { Answer } from '../entities/answer.entity';
import { Question } from '../entities/question.entity';
import { connectionLockKey, gamesSortFields } from '../constants/constants';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { IPaginationParams } from '../../../base/interfaces/pagination-params.interface';
import { GameQuestion } from '../entities/game-question.entity';
import { IGameStatus } from '../interfaces/game-status.interface';
import { ITopSort } from '../utils/parse-top-sort';
import { IAnswerStatus } from '../interfaces/answer-status.interface';
import { TopPlayerViewModel } from '../models/output/top-player-view.model';
import { User } from '../../users/entities/user.entity';
import {
  GamePairViewModel,
  GamePlayerProgressViewModel,
} from '../models/output/game-pair-view.model';

@Injectable()
export class GamesTypeormRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  transaction<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.entityManager.transaction(callback);
  }

  async lockConnections(manager: EntityManager): Promise<void> {
    await manager.query('SELECT pg_advisory_xact_lock($1)', [
      connectionLockKey,
    ]);
  }

  findUnfinishedGame(
    userId: string,
    manager: EntityManager = this.entityManager,
  ): Promise<Game | null> {
    const status = In([IGameStatus.PENDING_SECOND_PLAYER, IGameStatus.ACTIVE]);

    return manager.findOne(Game, {
      where: [
        { firstPlayerId: userId, status },
        { secondPlayerId: userId, status },
      ],
    });
  }

  findPendingGame(manager: EntityManager): Promise<Game | null> {
    return manager.findOne(Game, {
      where: { status: IGameStatus.PENDING_SECOND_PLAYER },
      order: { pairCreatedDate: 'ASC' },
    });
  }

  findActiveGameForUpdate(
    userId: string,
    manager: EntityManager,
  ): Promise<Game | null> {
    const status = IGameStatus.ACTIVE;

    return manager.findOne(Game, {
      where: [
        { firstPlayerId: userId, status },
        { secondPlayerId: userId, status },
      ],
      lock: { mode: 'pessimistic_write' },
    });
  }

  findGameQuestions(
    gameId: string,
    manager: EntityManager,
  ): Promise<GameQuestion[]> {
    return manager.find(GameQuestion, {
      where: { gameId },
      relations: { question: true },
      order: { position: 'ASC' },
    });
  }

  findAnswers(gameId: string, manager: EntityManager): Promise<Answer[]> {
    return manager.find(Answer, {
      where: { gameId },
      order: { id: 'ASC' },
    });
  }

  createGame(userId: string, manager: EntityManager): Promise<Game> {
    return manager.save(Game, manager.create(Game, { firstPlayerId: userId }));
  }

  async startGame(
    gameId: string,
    userId: string,
    questions: Question[],
    manager: EntityManager,
  ): Promise<void> {
    await manager.update(Game, gameId, {
      secondPlayerId: userId,
      status: IGameStatus.ACTIVE,
      startGameDate: new Date(),
    });

    if (questions.length) {
      await manager.insert(
        GameQuestion,
        questions.map(
          (question: Question, position: number): Partial<GameQuestion> => ({
            gameId,
            position,
            questionId: question.id,
          }),
        ),
      );
    }
  }

  createAnswer(
    answer: Pick<Answer, 'gameId' | 'userId' | 'questionId' | 'status'>,
    manager: EntityManager,
  ): Promise<Answer> {
    return manager.save(
      Answer,
      manager.create(Answer, { ...answer, addedAt: new Date() }),
    );
  }

  async updateGame(game: Game, manager: EntityManager): Promise<void> {
    await manager.update(Game, game.id, {
      status: game.status,
      finishGameDate: game.finishGameDate,
      firstPlayerScore: game.firstPlayerScore,
      secondPlayerScore: game.secondPlayerScore,
    });
  }

  async findGameView(gameId: string): Promise<GamePairViewModel | null> {
    const [game] = await this.findGameViews([gameId]);

    return game ?? null;
  }

  async findUserGames(
    userId: string,
    params: IPaginationParams,
  ): Promise<IPagination<GamePairViewModel>> {
    const sortBy = gamesSortFields.includes(params.sortBy)
      ? params.sortBy
      : 'pairCreatedDate';

    const query = this.entityManager
      .createQueryBuilder(Game, 'game')
      .select('game.id')
      .where('game.firstPlayerId = :userId OR game.secondPlayerId = :userId', {
        userId,
      })
      .orderBy(
        `game.${sortBy}`,
        params.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );

    // Ties are sorted by pairCreatedDate desc. TypeORM keys order rules by
    // column, so adding it again would overwrite the main sort direction.
    if (sortBy !== 'pairCreatedDate') {
      query.addOrderBy('game.pairCreatedDate', 'DESC');
    }

    const [games, totalCount] = await query
      .skip((params.pageNumber - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount();

    return {
      totalCount,
      page: params.pageNumber,
      pageSize: params.pageSize,
      pagesCount: Math.ceil(totalCount / params.pageSize),
      items: await this.findGameViews(games.map((game: Game) => game.id)),
    };
  }

  findFinishedUserGames(userId: string): Promise<Game[]> {
    const status = IGameStatus.FINISHED;

    return this.entityManager.find(Game, {
      where: [
        { firstPlayerId: userId, status },
        { secondPlayerId: userId, status },
      ],
    });
  }

  async findTopPlayers(
    sort: ITopSort[],
    pageNumber: number,
    pageSize: number,
  ): Promise<IPagination<TopPlayerViewModel>> {
    // One row per player per finished game, seen from that player's side.
    const playerGames = `
      SELECT first_player_id AS user_id,
             first_player_score AS score,
             second_player_score AS opponent_score
        FROM "Games" WHERE status = '${IGameStatus.FINISHED}'
      UNION ALL
      SELECT second_player_id, second_player_score, first_player_score
        FROM "Games" WHERE status = '${IGameStatus.FINISHED}'`;

    // Fields and directions are whitelisted by parseTopSort.
    const orderBy = sort
      .map(({ field, direction }) => `"${field}" ${direction.toUpperCase()}`)
      .join(', ');

    const [rows, [{ count }]] = await Promise.all([
      this.entityManager.query(
        `WITH player_games AS (${playerGames})
         SELECT u.id,
                u.login,
                SUM(pg.score)::int AS "sumScore",
                ROUND(AVG(pg.score), 2)::float AS "avgScores",
                COUNT(*)::int AS "gamesCount",
                COUNT(*) FILTER (WHERE pg.score > pg.opponent_score)::int AS "winsCount",
                COUNT(*) FILTER (WHERE pg.score < pg.opponent_score)::int AS "lossesCount",
                COUNT(*) FILTER (WHERE pg.score = pg.opponent_score)::int AS "drawsCount"
           FROM player_games pg
           JOIN "Users" u ON u.id = pg.user_id
          GROUP BY u.id, u.login
          ORDER BY ${orderBy}
          LIMIT $1 OFFSET $2`,
        [pageSize, (pageNumber - 1) * pageSize],
      ),
      this.entityManager.query(
        `WITH player_games AS (${playerGames})
         SELECT COUNT(DISTINCT user_id)::int AS count FROM player_games`,
      ),
    ]);

    return {
      page: pageNumber,
      pageSize,
      totalCount: count,
      pagesCount: Math.ceil(count / pageSize),
      items: rows.map((row) => ({
        sumScore: row.sumScore,
        avgScores: row.avgScores,
        gamesCount: row.gamesCount,
        winsCount: row.winsCount,
        lossesCount: row.lossesCount,
        drawsCount: row.drawsCount,
        player: { id: row.id, login: row.login },
      })),
    };
  }

  private async findGameViews(gameIds: string[]): Promise<GamePairViewModel[]> {
    if (!gameIds.length) {
      return [];
    }

    const games = await this.entityManager.find(Game, {
      where: { id: In(gameIds) },
      relations: {
        answers: true,
        firstPlayer: true,
        secondPlayer: true,
        questions: { question: true },
      },
    });

    const gamesById = new Map(games.map((game: Game) => [game.id, game]));

    return gameIds
      .map((gameId: string) => gamesById.get(gameId))
      .filter((game?: Game): game is Game => !!game)
      .map((game: Game) => this.mapToGameView(game));
  }

  private mapToGameView(game: Game): GamePairViewModel {
    const answers = [...game.answers].sort(
      (a: Answer, b: Answer): number => a.id - b.id,
    );

    const questions = [...game.questions].sort(
      (a: GameQuestion, b: GameQuestion): number => a.position - b.position,
    );

    const isPending = game.status === IGameStatus.PENDING_SECOND_PLAYER;

    return {
      id: game.id,
      status: game.status,
      firstPlayerProgress: this.mapToPlayerProgress(
        game.firstPlayer,
        game.firstPlayerScore,
        answers,
      ),
      secondPlayerProgress: game.secondPlayer
        ? this.mapToPlayerProgress(
            game.secondPlayer,
            game.secondPlayerScore,
            answers,
          )
        : null,
      questions: isPending
        ? null
        : questions.map(({ question }: GameQuestion) => ({
            id: question.id,
            body: question.body,
          })),
      pairCreatedDate: new Date(game.pairCreatedDate).toISOString(),
      startGameDate: game.startGameDate
        ? new Date(game.startGameDate).toISOString()
        : null,
      finishGameDate: game.finishGameDate
        ? new Date(game.finishGameDate).toISOString()
        : null,
    };
  }

  async deleteAll(): Promise<void> {
    await this.entityManager.createQueryBuilder().delete().from(Game).execute();
  }

  private mapToPlayerProgress(
    user: User,
    score: number,
    answers: Answer[],
  ): GamePlayerProgressViewModel {
    return {
      score,
      player: {
        id: user.id,
        login: user.login,
      },
      answers: answers
        .filter((answer: Answer): boolean => answer.userId === user.id)
        .map((answer: Answer) => ({
          questionId: answer.questionId,
          answerStatus: answer.status as IAnswerStatus,
          addedAt: new Date(answer.addedAt).toISOString(),
        })),
    };
  }
}
