import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from '@prisma/client';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostRepository) {}

  async create(dto: CreatePostDto): Promise<Post> {
    return this.postsRepository.create({
      title: dto.title,
      content: dto.content,
      author_user_id: dto.authorUserId,
    });
  }

  async findAll(
    dto: GetPostsDto,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const { posts, total } = await this.postsRepository.findAll({
      page,
      limit,
      search: dto.search,
    });

    return { posts, total, page, limit };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findById(id);
    if (!post) throw new NotFoundException(`Post ${id} not found.`);
    return post;
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.postsRepository.findById(id);
    if (!post) throw new NotFoundException(`Post ${id} not found.;`);
    return this.postsRepository.update(id, {
      ...(dto.title != undefined && { title: dto.title }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.authorUserId !== undefined && {
        author_user_id: dto.authorUserId,
      }),
    });
  }

  async remove(id: string): Promise<Post> {
    const post = await this.postsRepository.findById(id);
    if (!post) throw new NotFoundException(`Post ${id} not foud.`);
    return this.postsRepository.delete(id);
  }
}
