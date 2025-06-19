import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { DevicesController } from './api/devices.controller';
import { GetDeviceByUserIdUseCase } from './usecases/get-device-by-user-id.usecase';
import { GetDevicesByUserIdUseCase } from './usecases/get-devices-by-user-id.usecase';
import { RemoveDeviceByUserIdUseCase } from './usecases/remove-device-by-user-id.usecase';
import { RemoveDevicesByUserIdUseCase } from './usecases/remove-devices-by-user-id.usecase';

const useCases = [
  GetDeviceByUserIdUseCase,
  GetDevicesByUserIdUseCase,
  RemoveDeviceByUserIdUseCase,
  RemoveDevicesByUserIdUseCase,
];

@Module({
  imports: [UsersModule],
  controllers: [DevicesController],
  providers: [...useCases],
})
export class DevicesModule {}
