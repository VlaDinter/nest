import { Module } from '@nestjs/common';
import { PostsModule } from '@modules/posts/posts.module';
import { BlogsModule } from '@modules/blogs/blogs.module';
import { UsersModule } from '@modules/users/users.module';
import { CommentsModule } from '@modules/comments/comments.module';
import { TestingController } from '@modules/testing/api/testing.controller';
import { RemoveAllDataUseCase } from '@modules/testing/usecases/remove-all-data.usecase';

const useCases = [RemoveAllDataUseCase];

@Module({
  imports: [UsersModule, BlogsModule, PostsModule, CommentsModule],
  controllers: [TestingController],
  providers: [...useCases],
})
export class TestingModule {}
