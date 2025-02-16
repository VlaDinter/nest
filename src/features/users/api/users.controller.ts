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
  UseGuards
} from '@nestjs/common';
import { CreateUserInputModelType, UsersService } from '../application/users.service';
import { UserViewModel } from '../view-models/user-view-model';
import { FiltersInterface } from '../../../interfaces/filters.interface';
import { PaginationInterface } from '../../../interfaces/pagination.interface';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(
    @Query() filters: FiltersInterface,
  ): Promise<PaginationInterface<UserViewModel>> {
    return this.usersService.getUsers(filters);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  postUsers(@Body() inputModel: CreateUserInputModelType): Promise<UserViewModel> {
    return this.usersService.addUser(inputModel, true);
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
