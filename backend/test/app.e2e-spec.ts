import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import cookieParser from 'cookie-parser';
import type { HttpExceptionResponse } from '../src/common/filters/types/http-exception.types';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns { status: ok } without authentication', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('unauthenticated request returns structured error shape with requestId', async () => {
    const res = await request(app.getHttpServer()).get('/posts').expect(401);

    const body = res.body as HttpExceptionResponse;
    expect(body.error.status).toBe(401);
    expect(typeof body.error.message).toBe('string');
    expect(typeof body.error.requestId).toBe('string');
    expect(body.error.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('validation error returns first message string not an array', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notanemail', password: '' })
      .expect(400);

    const body = res.body as HttpExceptionResponse;
    expect(typeof body.error.message).toBe('string');
  });
});
