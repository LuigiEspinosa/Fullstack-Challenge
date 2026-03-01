import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { PostsReponse, GetPostsReponse } from './types/posts.types';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() dto: CreatePostDto): Promise<PostsReponse> {
    const post = await this.postsService.create(dto);
    return { data: post };
  }

  @Get()
  async findAll(@Query() dto: GetPostsDto): Promise<GetPostsReponse> {
    const { posts, total, page, limit } = await this.postsService.findAll(dto);
    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostsReponse> {
    const post = await this.postsService.findOne(id);
    return { data: post };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostsReponse> {
    const post = await this.postsService.update(id, dto);
    return { data: post };
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<PostsReponse> {
    const post = await this.postsService.remove(id);
    return { data: post };
  }
}
