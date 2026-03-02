import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    content: string;
    author_user_id: number;
  }): Promise<Post> {
    return this.prisma.post.create({ data });
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ posts: Post[]; total: number }> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts, total };
  }

  async findById(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
    return this.prisma.post.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Post> {
    return this.prisma.post.delete({ where: { id } });
  }
}
