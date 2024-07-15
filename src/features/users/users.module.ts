import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersMongooseRepository } from './infrastructure/mongo-repository/users.mongoose.repository';
import { User, UserSchema } from './entities/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersMongooseRepository],
  exports: [UsersService],
})
export class UsersModule {}
