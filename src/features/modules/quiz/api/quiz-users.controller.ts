import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Get, Query, Controller, DefaultValuePipe } from '@nestjs/common';
import { GamesService } from '../application/games.service';
import { defaultTopSort } from '../utils/parse-top-sort';
import { TopPlayerViewModel } from '../models/output/top-player-view.model';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { ParseNumberPipe } from '../../../common/pipes/parse-number.pipe';
import { getConfiguration } from '../../../../configuration/configuration';
import { IPagination } from '../../../base/interfaces/pagination.interface';

@ApiTags('PairQuizGame')
@Controller('pair-game-quiz/users')
export class QuizUsersController {
  constructor(private readonly gamesService: GamesService) {}

  @Api('Get users top')
  @ApiQuery({
    name: 'sort',
    required: false,
    isArray: true,
    type: String,
    example: defaultTopSort,
  })
  @Get('top')
  getTop(
    @Query('sort') sort: string | string[],
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
  ): Promise<IPagination<TopPlayerViewModel>> {
    return this.gamesService.getTopPlayers(sort, pageNumber, pageSize);
  }
}
