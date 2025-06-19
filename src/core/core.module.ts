import { join } from 'path';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CoreConfig } from './core.config';

@Global()
@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [CoreConfig],
      imports: [CoreModule],
      useFactory: (coreConfig: CoreConfig) => ({
        secret: coreConfig.jwtAccessTokenSecret,
        signOptions: {
          expiresIn: coreConfig.jwtAccessTokenExpiresIn,
        },
      }),
    }),
    MailerModule.forRootAsync({
      inject: [CoreConfig],
      imports: [CoreModule],
      useFactory: (coreConfig: CoreConfig) => ({
        defaults: {
          from: coreConfig.emailFrom,
        },
        transport: {
          service: coreConfig.emailFromService,
          auth: {
            user: coreConfig.emailFromUser,
            pass: coreConfig.emailFromPassword,
          },
        },
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [CoreConfig],
      imports: [CoreModule],
      useFactory: (coreConfig: CoreConfig) => {
        return {
          uri: coreConfig.mongoURI,
          dbName: coreConfig.mongoDBName,
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [CoreConfig],
      imports: [CoreModule],
      useFactory: (coreConfig: CoreConfig) => {
        return {
          throttlers: [
            {
              ttl: coreConfig.throttleTTL,
              limit: coreConfig.throttleLimit,
            },
          ],
        };
      },
    }),
    ServeStaticModule.forRootAsync({
      imports: [CoreModule],
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        return [
          {
            rootPath: join(__dirname, '..', '..', 'swagger-static'),
            serveRoot: coreConfig.isDevelopment() ? '/' : '/swagger',
          },
        ];
      },
    }),
  ],
  providers: [CoreConfig],
  exports: [CoreConfig, CqrsModule, PassportModule, JwtModule],
})
export class CoreModule {}
