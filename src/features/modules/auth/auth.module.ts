import { JwtService } from '@nestjs/jwt';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CoreConfig } from '@core/core.config';
import { CoreModule } from '@core/core.module';
import { UsersModule } from '@modules/users/users.module';
import { Logger } from '@src/features/base/adapters/logger';
import { AuthController } from '@modules/auth/api/auth.controller';
import { AuthService } from '@modules/auth/application/auth.service';
import { LoginUserUseCase } from '@modules/auth/usecases/login-user.usecase';
import { LogoutUserUseCase } from '@modules/auth/usecases/logout-user.usecase';
import { MailNotifications } from '@src/features/base/adapters/mail-notifications';
import { LoginMiddleware } from '@src/features/common/middlewares/login.middleware';
import { GetMeByUserIdUseCase } from '@modules/auth/usecases/get-me-by-user-id.usecase';
import { SendConfirmationHandler } from '@modules/auth/handlers/send-confirmation.handler';
import { SendRecoveryCodeHandler } from '@modules/auth/handlers/send-recovery-code.handler';
import { EditUserPasswordByCodeUseCase } from '@modules/auth/usecases/edit-user-password-by-code.usecase';
import { SendRecoveryCodeToUserUseCase } from '@modules/auth/usecases/send-recovery-code-to-user.usecase';
import { ValidateUserByLoginOrEmailQuery } from '@modules/auth/queries/validate-user-by-login-or-email.query';
import { SendConfirmationToUpdatedUserUseCase } from '@modules/auth/usecases/send-confirmation-to-updated-user.usecase';
import { SendConfirmationToCreatedUserUseCase } from '@modules/auth/usecases/send-confirmation-to-created-user.usecase';
import { EditUserEmailConfirmationByCodeUseCase } from '@modules/auth/usecases/edit-user-email-confirmation-by-code.usecase';

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
