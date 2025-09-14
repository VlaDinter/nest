import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { DevicesController } from './api/devices.controller';
import { DevicesService } from './application/devices.service';
import { Device, DeviceSchema } from './schemes/device.schema';
import { Device as DeviceEntity } from './entities/device.entity';
import { IRepoType } from '../../base/interfaces/repo-type.interface';
import { getConfiguration } from '../../../configuration/configuration';
import { DevicesMongooseRepository } from './infrastructure/mongo-repository/devices.mongoose.repository';
import { DevicesTypeormRepository } from './infrastructure/typeorm-repository/devices.typeorm.repository';

const providers = [
  {
    provide: 'DevicesRepository',
    useClass:
      getConfiguration().repoType === IRepoType.MONGO
        ? DevicesMongooseRepository
        : DevicesTypeormRepository,
  },
];

@Module({
  imports: [
    getConfiguration().repoType === IRepoType.SQL
      ? TypeOrmModule.forFeature([DeviceEntity])
      : MongooseModule.forFeature([
          {
            name: Device.name,
            schema: DeviceSchema,
          },
        ]),
  ],
  controllers: [DevicesController],
  providers: [DevicesService, ...providers],
  exports: [DevicesService],
})
export class DevicesModule {}
