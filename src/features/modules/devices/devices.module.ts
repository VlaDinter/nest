import { Module } from '@nestjs/common';
import { UsersModule } from '@modules/users/users.module';
import { DevicesController } from '@modules/devices/api/devices.controller';
import { GetDevicesByUserIdUseCase } from '@modules/devices/usecases/get-devices-by-user-id.usecase';
import { RemoveDeviceByUserIdUseCase } from '@modules/devices/usecases/remove-device-by-user-id.usecase';
import { RemoveDevicesByUserIdUseCase } from '@modules/devices/usecases/remove-devices-by-user-id.usecase';

const useCases = [
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
