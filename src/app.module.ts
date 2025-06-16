import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { DynamicModule, Module } from '@nestjs/common';
import { AppService } from '@src/app.service';
import { CoreModule } from '@core/core.module';
import { CoreConfig } from '@core/core.config';
import { configModule } from '@src/config/config';
import { AppController } from '@src/app.controller';
import { AuthModule } from '@modules/auth/auth.module';
import { PostsModule } from '@modules/posts/posts.module';
import { BlogsModule } from '@modules/blogs/blogs.module';
import { UsersModule } from '@modules/users/users.module';
import { DevicesModule } from '@modules/devices/devices.module';
import { TestingModule } from '@modules/testing/testing.module';
import { CommentsModule } from '@modules/comments/comments.module';
import { AuthGuard } from '@src/features/common/guards/auth.guard';
import { JwtStrategy } from '@src/features/common/strategies/jwt.strategy';
import { BasicStrategy } from '@src/features/common/strategies/basic.strategy';
import { LocalStrategy } from '@src/features/common/strategies/local.strategy';
import { RefreshStrategy } from '@src/features/common/strategies/refresh.strategy';
import { BadFieldsExceptionFilter } from '@src/features/common/filters/exception.filter';
import { BlogIsExistConstraint } from '@src/features/common/decorators/validation/blog-is-exist.decorator';

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
