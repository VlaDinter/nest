import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { DynamicModule, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { configModule } from './config/config';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';
import { AppController } from './app.controller';
import { AuthGuard } from './features/common/guards/auth.guard';
import { AuthModule } from './features/modules/auth/auth.module';
import { UsersModule } from './features/modules/users/users.module';
import { BlogsModule } from './features/modules/blogs/blogs.module';
import { PostsModule } from './features/modules/posts/posts.module';
import { JwtStrategy } from './features/common/strategies/jwt.strategy';
import { DevicesModule } from './features/modules/devices/devices.module';
import { TestingModule } from './features/modules/testing/testing.module';
import { BasicStrategy } from './features/common/strategies/basic.strategy';
import { LocalStrategy } from './features/common/strategies/local.strategy';
import { CommentsModule } from './features/modules/comments/comments.module';
import { RefreshStrategy } from './features/common/strategies/refresh.strategy';
import { BadFieldsExceptionFilter } from './features/common/filters/exception.filter';
import { BlogIsExistConstraint } from './features/common/decorators/validation/blog-is-exist.decorator';

const providers = [
  JwtStrategy,
  BasicStrategy,
  LocalStrategy,
  RefreshStrategy,
  BlogIsExistConstraint,
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
  {
    provide: APP_FILTER,
    useClass: BadFieldsExceptionFilter,
  },
];

@Module({
  imports: [
    configModule,
    CoreModule,
    AuthModule,
    UsersModule,
    BlogsModule,
    PostsModule,
    DevicesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...providers],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    const testingModule: DynamicModule['imports'] = [];

    if (coreConfig.includeTestingModule) {
      testingModule.push(TestingModule);
    }

    return {
      module: AppModule,
      imports: testingModule,
    };
  }
}
