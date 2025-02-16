import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConstants } from '../../constants';
import { AuthController } from './api/auth.controller';
import { EmailServiceMock } from '../email/application/email.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '5m' }
    }),
    ThrottlerModule.forRoot([{
      ttl: 10000,
      limit: 5
    }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailServiceMock],
  exports: [AuthService],
})
export class AuthModule {}
