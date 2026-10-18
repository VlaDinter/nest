import {
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  DefaultValuePipe,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { GamesService } from '../application/games.service';
import { AnswerInputModel } from '../models/input/answer-input.model';
import { AnswerViewModel } from '../models/output/answer-view.model';
import { GamePairViewModel } from '../models/output/game-pair-view.model';
import { ConnectToGameCommand } from '../usecases/commands/connect-to-game.command';
import { AnswerQuestionCommand } from '../usecases/commands/answer-question.command';
import { MyStatisticViewModel } from '../models/output/my-statistic-view.model';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { ParseNumberPipe } from '../../../common/pipes/parse-number.pipe';
import { ParseStringPipe } from '../../../common/pipes/parse-string.pipe';
import { ParseValuesPipe } from '../../../common/pipes/parse-values.pipe';
import { getConfiguration } from '../../../../configuration/configuration';
import { IPagination } from '../../../base/interfaces/pagination.interface';
import { ISortDirections } from '../../../base/interfaces/sort-directions.interface';
import { JwtAuthGuard } from '../../../common/guards/bearer/jwt-auth.guard';
import { UuidValidationPipe } from '../../../common/pipes/uuid-validation.pipe';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';

@ApiTags('PairQuizGame')
@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz')
export class PairGameQuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly gamesService: GamesService,
  ) {}

  @Api('Get current game', false, false, true)
  @Get('pairs/my-current')
  async getCurrentGame(
    @CurrentUserId() currentUserId: string,
  ): Promise<GamePairViewModel> {
    const game = await this.gamesService.getCurrentGame(currentUserId);

    if (!game) {
      throw new NotFoundException('Active game not found');
    }

    return game;
  }

  @Api('Get my games', false, false, true)
  @Get('pairs/my')
  getMyGames(
    @CurrentUserId() currentUserId: string,
    @Query(
      'pageSize',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageSize),
    )
    pageSize: number,
    @Query(
      'pageNumber',
      ParseNumberPipe,
      new DefaultValuePipe(getConfiguration().pageNumber),
    )
    pageNumber: number,
    @Query('sortBy', ParseStringPipe, new DefaultValuePipe('pairCreatedDate'))
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new ParseValuesPipe([ISortDirections.ASC, ISortDirections.DESC]),
      new DefaultValuePipe(ISortDirections.DESC),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<GamePairViewModel>> {
    return this.gamesService.getUserGames(currentUserId, {
      sortBy,
      pageSize,
      pageNumber,
      sortDirection,
    });
  }

  @Api('Get my statistic', false, false, true)
  @Get('users/my-statistic')
  getMyStatistic(
    @CurrentUserId() currentUserId: string,
  ): Promise<MyStatisticViewModel> {
    return this.gamesService.getUserStatistic(currentUserId);
  }

  @Api('Get game', true, false, true)
  @Get('pairs/:id')
  async getGame(
    @CurrentUserId() currentUserId: string,
    @Param('id', UuidValidationPipe) gameId: string,
  ): Promise<GamePairViewModel> {
    const game = await this.gamesService.getGame(gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const isParticipant =
      game.firstPlayerProgress.player.id === currentUserId ||
      game.secondPlayerProgress?.player.id === currentUserId;

    if (!isParticipant) {
      throw new ForbiddenException('User is not a participant of this game');
    }

    return game;
  }

  @Api('Connect to game', false, false, true)
  @Post('pairs/connection')
  @HttpCode(HttpStatus.OK)
  async connect(
    @CurrentUserId() currentUserId: string,
  ): Promise<GamePairViewModel> {
    const game = await this.commandBus.execute<
      ConnectToGameCommand,
      GamePairViewModel | null
    >(new ConnectToGameCommand(currentUserId));

    if (!game) {
      throw new ForbiddenException('User is already participating in a game');
    }

    return game;
  }

  @Api('Send answer', false, false, true)
  @Post('pairs/my-current/answers')
  @HttpCode(HttpStatus.OK)
  async answer(
    @CurrentUserId() currentUserId: string,
    @Body() inputModel: AnswerInputModel,
  ): Promise<AnswerViewModel> {
    const answer = await this.commandBus.execute<
      AnswerQuestionCommand,
      AnswerViewModel | null
    >(new AnswerQuestionCommand(currentUserId, inputModel.answer));

    if (!answer) {
      throw new ForbiddenException(
        'User is not in an active game or has answered all questions',
      );
    }

    return answer;
  }
}
