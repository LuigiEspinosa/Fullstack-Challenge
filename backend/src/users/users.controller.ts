import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { Roles } from '../../src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('users')
@ApiCookieAuth('session')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Import a user from ReqRes and save to local DB' })
  @ApiResponse({ status: 201, description: 'User imported.' })
  @ApiResponse({ status: 401, description: 'User not found on ReqRes.' })
  @Post('import/:id')
  async importUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.importUser(id);
    return { data: user };
  }

  @ApiOperation({ summary: 'List all locally saved users' })
  @ApiResponse({ status: 200, description: 'Array of saved users.' })
  @Get('saved')
  async getSaved() {
    const users = await this.usersService.getSaved();
    return { data: users };
  }

  @ApiOperation({ summary: 'Get one locally saved user by id' })
  @ApiResponse({ status: 200, description: 'Saved user.' })
  @ApiResponse({ status: 404, description: 'User not in local DB.' })
  @Get('saved/:id')
  async getOneSaved(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.getOneSaved(id);
    return { data: user };
  }

  @ApiOperation({ summary: 'Delete a locally saved user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  @Delete('saved/:id')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteSaved(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.deleteSaved(id);
    return { data: user };
  }

  @Public()
  @ApiOperation({ summary: 'List users from ReqRes API (public proxy) ' })
  @ApiQuery({
    name: 'page',
    required: false,
    schema: { default: 1, type: 'number' },
    description: 'Page number (1 or 2)',
  })
  @ApiResponse({ status: 200, description: 'Paginated ReqRes user list.' })
  @Get('reqres')
  getReqResUsers(@Query('page') page = '1') {
    return this.usersService.getReqResUsers(Number(page));
  }

  @Public()
  @ApiOperation({ summary: 'List users from ReqRes API (public proxy)' })
  @ApiParam({
    name: 'id',
    schema: { type: 'number' },
    description: 'ReqRes user ID (1-12)',
  })
  @ApiResponse({ status: 200, description: 'ReqRes user object.' })
  @ApiResponse({ status: 404, description: 'User not found on ReqRes.' })
  @Get('reqres/:id')
  getReqResUser(@Param('id') id: string) {
    return this.usersService.getReqResUser(Number(id));
  }
}
