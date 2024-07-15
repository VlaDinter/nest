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
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { FiltersType } from '../../../types/FiltersType';
import { PaginationType } from '../../../types/PaginationType';
import { UserViewModel } from '../view-models/user-view-model';
import { UserDto } from '../dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(
    @Query() filters: FiltersType,
  ): Promise<PaginationType<UserViewModel>> {
    return this.usersService.getUsers(filters);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  postUsers(@Body() createUserDto: UserDto): Promise<UserViewModel> {
    return this.usersService.addUser(createUserDto);
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
