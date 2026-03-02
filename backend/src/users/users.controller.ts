import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { Roles } from '../../src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

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
}
