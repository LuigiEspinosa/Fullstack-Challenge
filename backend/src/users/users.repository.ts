import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SavedUser } from '@prisma/client';
import { UpsertUserInput } from './types/users.types';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: UpsertUserInput): Promise<SavedUser> {
    return this.prisma.savedUser.upsert({
      where: { id: data.id },
      update: { ...data, saved_at: new Date() },
      create: data,
    });
  }

  async findAll(): Promise<SavedUser[]> {
    return this.prisma.savedUser.findMany({ orderBy: { saved_at: 'desc' } });
  }

  async findById(id: number): Promise<SavedUser | null> {
    return this.prisma.savedUser.findUnique({ where: { id } });
  }

  async delete(id: number): Promise<SavedUser> {
    return this.prisma.savedUser.delete({ where: { id } });
  }
}
