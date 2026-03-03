import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import type { LoginResponse, LogoutResponse } from './types/auth.types';

type ReqResLoginResponse = { token: string };

@Injectable()
export class AuthService {
  private cookieOptions(isProd: boolean) {
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as unknown as 'none' | 'lax',
      maxAge: 86400 * 1000,
    };
  }

  async login(dto: LoginDto, res: Response): Promise<LoginResponse> {
    const reqresRes = await fetch('https://reqres.in/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REQRES_API_KEY ?? '',
      },
      body: JSON.stringify({ email: dto.email, password: dto.password }),
    });

    if (!reqresRes.ok) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const { token } = (await reqresRes.json()) as ReqResLoginResponse;
    const role = dto.email === 'eve.holt@reqres.in' ? 'ADMIN' : 'USER';
    const opts = this.cookieOptions(process.env.NODE_ENV === 'production');

    res.cookie('session', token, opts);
    res.cookie('role', role, opts);

    return { data: { message: 'Login successful.', role } };
  }

  logout(res: Response): LogoutResponse {
    const opts = this.cookieOptions(process.env.NODE_ENV === 'production');
    res.clearCookie('session', opts);
    res.clearCookie('role', opts);
    return { data: { message: 'Logged out.' } };
  }
}
