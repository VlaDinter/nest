import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConstants } from '../../constants';
import { AuthController } from './api/auth.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { BasicStrategy } from './strategies/basic.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { MailManager } from '../../adapters/mail-manager';
import { LoginUserUseCase } from './application/use-cases/login-user-use-case';
import { SendConfirmationToCreatedUserUseCase } from './application/use-cases/send-confirmation-to-created-user-use-case';
import { SendConfirmationToUpdatedUserUseCase } from './application/use-cases/send-confirmation-to-updated-user-use-case';
import { SendRecoveryCodeToUserUseCase } from './application/use-cases/send-recovery-code-to-user-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { TokenStrategy } from './strategies/token.strategy';

const adapters = [
  MailManager,
  LocalStrategy,
  JwtStrategy,
  BasicStrategy,
  TokenStrategy,
];
const useCases = [
  LoginUserUseCase,
  SendConfirmationToCreatedUserUseCase,
  SendConfirmationToUpdatedUserUseCase,
  SendRecoveryCodeToUserUseCase,
];

@Module({
  imports: [
    UsersModule,
    CqrsModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '59m' },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, ...adapters, ...useCases],
  exports: [AuthService],
})
export class AuthModule {}
