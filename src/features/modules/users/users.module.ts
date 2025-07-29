import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersConfig } from './config/users.config';
import { UsersController } from './api/users.controller';
import { User, UserSchema } from './schemes/user.schema';
import { UsersService } from './application/users.service';
import { Device } from '../devices/entities/device.entity';
import { User as UserEntity } from './entities/user.entity';
import { IRepoType } from '../../base/interfaces/repo-type.interface';
import { getConfiguration } from '../../../configuration/configuration';
import { EmailConfirmation } from './entities/email-confirmation.entity';
import { getUsersConfiguration } from './configuration/users.configuration';
import { UsersTypeormRepository } from './infrastructure/typeorm-repository/users.typeorm.repository';
import { UsersMongooseRepository } from './infrastructure/mongo-repository/users.mongoose.repository';
import { AddUserWithValidateOrRejectModelUseCase } from './usecases/add-user-with-validate-or-reject-model.usecase';

const providers = [
  UsersConfig,
  {
    provide: 'UsersRepository',
    useClass:
      getConfiguration().repoType === IRepoType.MONGO
        ? UsersMongooseRepository
        : UsersTypeormRepository,
  },
];

const useCases = [AddUserWithValidateOrRejectModelUseCase];

@Module({
  imports: [
    ConfigModule.forFeature(getUsersConfiguration),
    getConfiguration().repoType === IRepoType.SQL
      ? TypeOrmModule.forFeature([UserEntity, Device, EmailConfirmation])
      : MongooseModule.forFeature([
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
