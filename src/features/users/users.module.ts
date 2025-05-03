import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersMongooseRepository } from './infrastructure/mongo-repository/users.mongoose.repository';
import { User, UserSchema } from './entities/user.schema';
import { AddUserWithValidateOrRejectModelUseCase } from './application/use-cases/add-user-with-validate-or-reject-model-use-case';
import { CqrsModule } from '@nestjs/cqrs';

const adapters = [UsersMongooseRepository];
const useCases = [AddUserWithValidateOrRejectModelUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    CqrsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, ...adapters, ...useCases],
  exports: [UsersService],
})
export class UsersModule {}
