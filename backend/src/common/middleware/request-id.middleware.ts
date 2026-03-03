import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request & { requestId: string }, res: Response, next: NextFunction) {
    req.requestId = crypto.randomUUID();
    const { method, originalUrl, requestId } = req;
    const start = Date.now();

    this.logger.log(`[${requestId}] --> ${method} ${originalUrl}`);

    res.on('finish', () => {
      this.logger.log(
        `[${requestId}] <-- ${method} ${originalUrl} ${Date.now() - start}ms`,
      );
    });

    next();
  }
}
