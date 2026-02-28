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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('import/:id')
  async importUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.importUser(id);
    return { data: user };
  }

  @Get('saved')
  async getSaved() {
    const users = await this.usersService.getSaved();
    return { data: users };
  }

  @Get('saved/:id')
  async getOneSaved(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.getOneSaved(id);
    return { data: user };
  }

  @Delete('saved/:id')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteSaved(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.deleteSaved(id);
    return { data: user };
  }
}
