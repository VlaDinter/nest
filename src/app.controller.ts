import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Api } from './features/common/decorators/validation/api.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Api('Home')
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
