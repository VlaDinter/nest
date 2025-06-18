import {
  Scope,
  Delete,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { Api } from '../../../common/decorators/validation/api.decorator';
import { RemoveAllDataCommand } from '../usecases/commands/remove-all-data.command';

@ApiTags('Testing')
@Controller({ path: 'testing', scope: Scope.REQUEST })
export class TestingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Api('Delete all data')
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData(): Promise<void> {
    const command = new RemoveAllDataCommand();

    await this.commandBus.execute<RemoveAllDataCommand, void>(command);
  }
}
