import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostRepository } from './posts.repository';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostRepository],
})
export class PostsModule {}
