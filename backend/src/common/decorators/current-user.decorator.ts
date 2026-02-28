import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface CurrentUserData {
  userId: number;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentUserData => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return {
      userId: Number(req.cookies?.userId ?? 0),
      role: String(req.cookies?.role ?? 'USER'),
    };
  },
);
