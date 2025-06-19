import { JwtService } from '@nestjs/jwt';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Logger } from '../../base/adapters/logger';
import { UsersModule } from '../users/users.module';
import { CoreConfig } from '../../../core/core.config';
import { CoreModule } from '../../../core/core.module';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { LoginUserUseCase } from './usecases/login-user.usecase';
import { LogoutUserUseCase } from './usecases/logout-user.usecase';
import { MailNotifications } from '../../base/adapters/mail-notifications';
import { GetMeByUserIdUseCase } from './usecases/get-me-by-user-id.usecase';
import { LoginMiddleware } from '../../common/middlewares/login.middleware';
import { SendConfirmationHandler } from './handlers/send-confirmation.handler';
import { SendRecoveryCodeHandler } from './handlers/send-recovery-code.handler';
import { EditDeviceByUserIdUseCase } from './usecases/edit-device-by-user-id.usecase';
import { EditUserPasswordByCodeUseCase } from './usecases/edit-user-password-by-code.usecase';
import { SendRecoveryCodeToUserUseCase } from './usecases/send-recovery-code-to-user.usecase';
import { ValidateUserByLoginOrEmailQuery } from './queries/validate-user-by-login-or-email.query';
import { SendConfirmationToCreatedUserUseCase } from './usecases/send-confirmation-to-created-user.usecase';
import { SendConfirmationToUpdatedUserUseCase } from './usecases/send-confirmation-to-updated-user.usecase';
import { EditUserEmailConfirmationByCodeUseCase } from './usecases/edit-user-email-confirmation-by-code.usecase';

const providers = [
  {
    inject: [CoreConfig],
    imports: [CoreModule],
    provide: 'ACCESS_TOKEN_STRATEGY_INJECT_TOKEN',
    useFactory: (coreConfig: CoreConfig): JwtService => {
      return new JwtService({
        secret: coreConfig.jwtAccessTokenSecret,
        signOptions: { expiresIn: coreConfig.jwtAccessTokenExpiresIn },
      });
    },
  },
  {
    inject: [CoreConfig],
    imports: [CoreModule],
    provide: 'REFRESH_TOKEN_STRATEGY_INJECT_TOKEN',
    useFactory: (coreConfig: CoreConfig): JwtService => {
      return new JwtService({
        secret: coreConfig.jwtRefreshTokenSecret,
        signOptions: { expiresIn: coreConfig.jwtRefreshTokenExpiresIn },
      });
    },
  },
];

const adapters = [Logger, MailNotifications];
const useCases = [
  LoginUserUseCase,
  LogoutUserUseCase,
  GetMeByUserIdUseCase,
  SendConfirmationHandler,
  SendRecoveryCodeHandler,
  EditDeviceByUserIdUseCase,
  EditUserPasswordByCodeUseCase,
  SendRecoveryCodeToUserUseCase,
  ValidateUserByLoginOrEmailQuery,
  SendConfirmationToCreatedUserUseCase,
  SendConfirmationToUpdatedUserUseCase,
  EditUserEmailConfirmationByCodeUseCase,
];

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, ...providers, ...adapters, ...useCases],
  exports: [AuthService, ...adapters],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoginMiddleware).forRoutes('auth/login');
  }
}
