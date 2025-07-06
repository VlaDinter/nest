import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersConfig } from './config/users.config';
import { UsersController } from './api/users.controller';
import { User, UserSchema } from './entities/user.schema';
import { UsersService } from './application/users.service';
import { IRepoType } from '../../base/interfaces/repo-type.interface';
import { getConfiguration } from '../../../configuration/configuration';
import { getUsersConfiguration } from './configuration/users.configuration';
import { UsersSQLRepository } from './infrastructure/sql-repository/users.sql.repository';
import { UsersMongooseRepository } from './infrastructure/mongo-repository/users.mongoose.repository';
import { AddUserWithValidateOrRejectModelUseCase } from './usecases/add-user-with-validate-or-reject-model.usecase';

const providers = [
  UsersConfig,
  {
    provide: 'UsersRepository',
    useClass:
      getConfiguration().repoType === IRepoType.MONGO
        ? UsersMongooseRepository
        : UsersSQLRepository,
  },
];

const useCases = [AddUserWithValidateOrRejectModelUseCase];

@Module({
  imports: [
    ConfigModule.forFeature(getUsersConfiguration),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, ...providers, ...useCases],
  exports: [UsersService],
})
export class UsersModule {}
