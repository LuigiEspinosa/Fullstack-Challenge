import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { SavedUser } from '@prisma/client';
import type { ReqResUser, ReqResUsersResponse } from './types/users.types';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async importUser(id: number): Promise<SavedUser> {
    const res = await fetch(`https://reqres.in/api/users/${id}`, {
      headers: { 'x-api-key': process.env.REQRES_API_KEY ?? '' },
    });

    if (res.status === 404)
      throw new NotFoundException(`User ${id} not found on ReqRes.`);
    if (!res.ok) throw new InternalServerErrorException('ReqRes unavailable');

    const { data } = (await res.json()) as { data: ReqResUser };

    return this.usersRepository.upsert({
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      avatar: data.avatar,
    });
  }

  async getSaved(): Promise<SavedUser[]> {
    return this.usersRepository.findAll();
  }

  async getOneSaved(id: number): Promise<SavedUser> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`Saved user ${id} not foud.`);
    return user;
  }

  async deleteSaved(id: number): Promise<SavedUser> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`Saved user ${id} not found.`);
    return this.usersRepository.delete(id);
  }

  async getReqResUsers(page: number) {
    const res = await fetch(`https://reqres.in/api/users?page=${page}`, {
      headers: { 'x-api-key': process.env.REQRES_API_KEY ?? '' },
    });
    if (!res.ok) throw new NotFoundException('Could not reach ReqRes.');
    return res.json() as Promise<ReqResUsersResponse>;
  }

  async getReqResUser(id: number) {
    const res = await fetch(`https://reqres.in/api/users/${id}`, {
      headers: { 'x-api-key': process.env.REQRES_API_KEY ?? '' },
    });
    if (!res.ok) throw new NotFoundException(`User ${id} not found on ReqRes.`);
    return res.json() as Promise<ReqResUser>;
  }
}
