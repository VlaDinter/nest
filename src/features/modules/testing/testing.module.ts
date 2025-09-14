import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { DevicesModule } from '../devices/devices.module';
import { CommentsModule } from '../comments/comments.module';
import { TestingController } from './api/testing.controller';
import { RemoveAllDataUseCase } from './usecases/remove-all-data.usecase';

const useCases = [RemoveAllDataUseCase];

@Module({
  imports: [
    UsersModule,
    BlogsModule,
    PostsModule,
    DevicesModule,
    CommentsModule,
  ],
  controllers: [TestingController],
  providers: [...useCases],
})
export class TestingModule {}
