import {
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
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
import { Api } from '../../../common/decorators/validation/api.decorator';
import { JwtAuthGuard } from '../../../common/guards/bearer/jwt-auth.guard';
import { UuidValidationPipe } from '../../../common/pipes/uuid-validation.pipe';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';

@ApiTags('PairQuizGame')
@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz/pairs')
export class PairGameQuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly gamesService: GamesService,
  ) {}

  @Api('Get current game', false, false, true)
  @Get('my-current')
  async getCurrentGame(
    @CurrentUserId() currentUserId: string,
  ): Promise<GamePairViewModel> {
    const game = await this.gamesService.getCurrentGame(currentUserId);

    if (!game) {
      throw new NotFoundException('Active game not found');
    }

    return game;
  }

  @Api('Get game', true, false, true)
  @Get(':id')
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
  @Post('connection')
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
  @Post('my-current/answers')
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
