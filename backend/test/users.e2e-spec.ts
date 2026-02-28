import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type {
  GetSavedUsersResponse,
  UpsertUserResponse,
} from '../src/users/types/users.types';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let adminCookie: string;
  let prisma: PrismaService;

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

    prisma = app.get(PrismaService);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'eve.holt@reqres.in', password: 'pistol' })
      .expect(201);

    const cookies = loginRes.headers['set-cookie'] as unknown as string[];
    adminCookie =
      cookies.find((c) => c.startsWith('session='))?.split(';')[0] ?? '';
  });

  afterAll(async () => {
    await prisma.savedUser.deleteMany();
    await app.close();
  });

  describe('POST /users/import/:id', () => {
    it('imports and saves a user from ReqRes', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/import/1')
        .set('Cookie', adminCookie)
        .expect(201);

      const body = res.body as UpsertUserResponse;
      expect(body.data.id).toBe(1);
      expect(body.data.email).toBeDefined();
      expect(body.data.first_name).toBeDefined();
    });

    it('is idempotent - calling twice does not create duplicates', async () => {
      await request(app.getHttpServer())
        .post('/users/import/1')
        .set('Cookie', adminCookie)
        .expect(201);

      const saved = await prisma.savedUser.findMany({ where: { id: 1 } });
      expect(saved).toHaveLength(1);
    });

    it('returns 404 for a user that does not exists on ReqRes', () => {
      return request(app.getHttpServer())
        .post('/users/import/9999')
        .set('Cookie', adminCookie)
        .expect(404);
    });
  });

  describe('GET /users/saved', () => {
    it('returns all locally saved users as an array', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/saved')
        .set('Cookie', adminCookie)
        .expect(200);

      const body = res.body as GetSavedUsersResponse;
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /users/saved/:id', () => {
    it('returns a single saved user by id', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/saved/1')
        .set('Cookie', adminCookie)
        .expect(200);

      expect((res.body as UpsertUserResponse).data.id).toBe(1);
    });

    it('returns 404 for a user not in local DB', () => {
      return request(app.getHttpServer())
        .get('/users/saved/9999')
        .set('Cookie', adminCookie)
        .expect(404);
    });
  });
});
