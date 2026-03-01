import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import type { LoginResponse, LogoutResponse } from './types/auth.types';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login and receive session cookie' })
  @ApiResponse({ status: 201, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @Public()
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    return this.authService.login(dto, res);
  }

  @ApiOperation({ summary: 'Logout and clear session cookie' })
  @ApiResponse({ status: 201, description: 'Logged out.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @HttpCode(200)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): LogoutResponse {
    return this.authService.logout(res);
  }
}
