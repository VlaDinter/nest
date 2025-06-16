import {
  Get,
  Body,
  Post,
  Query,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { getConfiguration } from '@src/configuration/configuration';
import { UsersService } from '@modules/users/application/users.service';
import { UserViewModel } from '@modules/users/models/output/user-view.model';
import { UserInputModel } from '@modules/users/models/input/user-input.model';
import { Api } from '@src/features/common/decorators/validation/api.decorator';
import { ParseStringPipe } from '@src/features/common/pipes/parse-string.pipe';
import { ParseNumberPipe } from '@src/features/common/pipes/parse-number.pipe';
import { ParseValuesPipe } from '@src/features/common/pipes/parse-values.pipe';
import { IPagination } from '@src/features/base/interfaces/pagination.interface';
import { BasicAuthGuard } from '@src/features/common/guards/basic/basic-auth.guard';
import { ISortDirections } from '@src/features/base/interfaces/sort-directions.interface';
import { ObjectIdValidationPipe } from '@src/features/common/pipes/object-id-validation.pipe';
import { AddUserWithValidateOrRejectModelCommand } from '@modules/users/usecases/commands/add-user-with-validate-or-reject-model.command';

@ApiTags('Users')
@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersService: UsersService,
  ) {}

  @Api('Get users', false, true)
  @Get()
  getUsers(
    @Query('searchLoginTerm', ParseStringPipe) searchLoginTerm: string,
    @Query('searchEmailTerm', ParseStringPipe) searchEmailTerm: string,
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
    @Query(
      'sortBy',
      ParseStringPipe,
      new DefaultValuePipe(getConfiguration().sortBy),
    )
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new ParseValuesPipe([ISortDirections.ASC, ISortDirections.DESC]),
      new DefaultValuePipe(getConfiguration().sortDirection),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<UserViewModel>> {
    return this.usersService.getUsers({
      sortBy,
      pageSize,
      pageNumber,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    });
  }

  @Api('Post users', false, true)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  postUsers(@Body() inputModel: UserInputModel): Promise<UserViewModel> {
    const command = new AddUserWithValidateOrRejectModelCommand(
      inputModel,
      true,
    );

    return this.commandBus.execute<
      AddUserWithValidateOrRejectModelCommand,
      UserViewModel
    >(command);
  }

  @Api('Delete user', true, true)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ObjectIdValidationPipe) userId: string,
  ): Promise<void> {
    const deletedUser = await this.usersService.removeUser(userId);

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
  }
}
