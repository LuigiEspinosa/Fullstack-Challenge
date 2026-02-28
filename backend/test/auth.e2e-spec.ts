import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { App } from 'supertest/types';
import type { LogoutResponse } from 'src/auth/types/auth.types';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let adminCookie: string;

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

    // Single reqres.in call - reused across all authenticated tests
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'eve.holt@reqres.in', password: 'pistol' })
      .expect(201);

    const cookies = res.headers['set-cookie'] as unknown as string[];
    adminCookie =
      cookies.find((c) => c.startsWith('session='))?.split(';')[0] ?? '';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('returns 201 and sets session + role cookies on valid credentials', () => {
      expect(adminCookie).toMatch(/^session=.+/);
    });

    it('return 401 on invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'wrong' })
        .expect(401);
    });

    it('return 400 when body fails validation', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'notanemail', password: '' })
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 401 without a session cookie', () => {
      return request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('returns 200 and clears cookies when authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', adminCookie)
        .expect(200);

      expect((res.body as LogoutResponse).data.message).toBe('Logged out.');
    });
  });
});
