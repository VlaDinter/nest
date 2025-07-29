import { join } from 'path';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { CoreConfig } from './core.config';
import { getConfiguration } from '../configuration/configuration';
import { IRepoType } from '../features/base/interfaces/repo-type.interface';
import { PluralNamingStrategy } from '../features/common/strategies/naming.strategy';

const getRepoModule = (): DynamicModule[] => {
  const repoModule: DynamicModule[] = [];

  if (getConfiguration().repoType === IRepoType.MONGO) {
    repoModule.push(
      MongooseModule.forRootAsync({
        inject: [CoreConfig],
        imports: [CoreModule],
        useFactory: (coreConfig: CoreConfig) => ({
          uri: coreConfig.mongoURI,
          dbName: coreConfig.mongoDBName,
        }),
      }),
    );
  }

  if (getConfiguration().repoType === IRepoType.SQL) {
    repoModule.push(
      TypeOrmModule.forRootAsync({
        inject: [CoreConfig],
        imports: [CoreModule],
        useFactory: (coreConfig: CoreConfig) => ({
          type: 'postgres',
          synchronize: true,
          logging: ['query'],
          autoLoadEntities: true,
          host: coreConfig.pgHost,
          port: coreConfig.pgPort,
          username: coreConfig.pgUser,
          password: coreConfig.pgPassword,
          database: coreConfig.pgDatabase,
          namingStrategy: new PluralNamingStrategy(),
          ssl:
            coreConfig.pgHost === 'localhost'
              ? undefined
              : {
                  rejectUnauthorized: false,
                },
        }),
      }),
    );
  }

  return repoModule;
};

@Global()
@Module({
  imports: [
    CqrsModule,
    PassportModule,
    ...getRepoModule(),
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
    ThrottlerModule.forRootAsync({
      inject: [CoreConfig],
      imports: [CoreModule],
      useFactory: (coreConfig: CoreConfig) => ({
        throttlers: [
          {
            ttl: coreConfig.throttleTTL,
            limit: coreConfig.throttleLimit,
          },
        ],
      }),
    }),
    ServeStaticModule.forRootAsync({
      imports: [CoreModule],
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => [
        {
          rootPath: join(__dirname, '..', '..', 'swagger-static'),
          serveRoot: coreConfig.isDevelopment() ? '/' : '/swagger',
        },
      ],
    }),
  ],
  providers: [CoreConfig],
  exports: [CoreConfig, CqrsModule, PassportModule, JwtModule],
})
export class CoreModule {}
