import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  CreateUserInputModelType,
  UsersService,
} from '../application/users.service';
import { UserViewModel } from '../view-models/user-view-model';
import { IPagination } from '../../../interfaces/pagination.interface';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { ParseStringPipe } from '../../../parse-string.pipe';
import { ISortDirections } from '../../../interfaces/sort-directions.interface';
import { CommandBus } from '@nestjs/cqrs';
import { AddUserWithValidateOrRejectModelCommand } from '../application/use-cases/add-user-with-validate-or-reject-model-use-case';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  getUsers(
    @Query('searchLoginTerm', ParseStringPipe) searchLoginTerm: string,
    @Query('searchEmailTerm', ParseStringPipe) searchEmailTerm: string,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Query('sortBy', ParseStringPipe, new DefaultValuePipe('createdAt'))
    sortBy: string,
    @Query(
      'sortDirection',
      ParseStringPipe,
      new DefaultValuePipe(ISortDirections.DESC),
    )
    sortDirection: ISortDirections,
  ): Promise<IPagination<UserViewModel>> {
    return this.usersService.getUsers({
      searchLoginTerm,
      searchEmailTerm,
      sortDirection,
      pageNumber,
      pageSize,
      sortBy,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  postUsers(
    @Body() inputModel: CreateUserInputModelType,
  ): Promise<UserViewModel> {
    return this.commandBus.execute(
      new AddUserWithValidateOrRejectModelCommand(inputModel, true),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') userId: string): Promise<void> {
    const deletedUser = await this.usersService.removeUser(userId);

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
  }
}
