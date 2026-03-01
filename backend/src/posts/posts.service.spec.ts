import { Post } from '@prisma/client';
import { PostsService } from './posts.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PostRepository } from './posts.repository';
import { NotFoundException } from '@nestjs/common';

const mockPost: Post = {
  id: 'post-1',
  title: 'Test post',
  content: 'Test content here',
  author_user_id: 4,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockRepo = {
  findById: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PostRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  describe('remove()', () => {
    it('throws NotFoundException when post does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes and returns the post when it exists', async () => {
      mockRepo.findById.mockResolvedValue(mockPost);
      mockRepo.delete.mockResolvedValue(mockPost);
      await expect(service.remove('post-1')).resolves.toEqual(mockPost);
    });
  });

  describe('findOne()', () => {
    it('throws NotFoundException when post does not exist', async () => {
      mockRepo.findById.mockResolvedValue(mockPost);
      await expect(service.findOne('post-1')).resolves.toEqual(mockPost);
    });
  });
});
