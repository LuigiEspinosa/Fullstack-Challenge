import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type {
  PostsReponse,
  GetPostsReponse,
} from '../src/posts/types/posts.types';

// AuthGuard only checks that session cookie exists, not its value.
// Crafting a non-admin cookie avoids a second live reqres.in call.
const NON_ADMIN_COOKE = 'session=faketoken; role=USER';

describe('Posts (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminCookie: string;
  let createdPostId: string;

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
    prisma = moduleFixture.get(PrismaService);
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'eve.holt@reqres.in', password: 'pistol' })
      .expect(201);

    const cookies = res.headers['set-cookie'] as unknown as string[];
    const session =
      cookies.find((c) => c.startsWith('session='))?.split(';')[0] ?? '';
    const role =
      cookies.find((c) => c.startsWith('role='))?.split(';')[0] ?? '';
    adminCookie = `${session}; ${role}`;
  });

  afterAll(async () => {
    await prisma.post.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /posts', () => {
    it('creates a post with valid data and returns 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', adminCookie)
        .send({
          title: 'My first post',
          content: 'Content that is long enough',
          authorUserId: 4,
        })
        .expect(201);

      const body = res.body as PostsReponse;
      expect(body.data.id).toBeDefined();
      expect(body.data.title).toBe('My first post');
      createdPostId = body.data.id;
    });

    it('returns 400 when title is too short', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', adminCookie)
        .send({
          title: 'ab',
          content: 'Content that is long enough.',
          authorUserId: 4,
        })
        .expect(400);
    });

    it('returns 400 when content is too short', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', adminCookie)
        .send({
          title: 'Valid title',
          content: 'short',
          authorUserId: 4,
        })
        .expect(400);
    });

    it('returns 400 when authorUserId is not a positive integer', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', adminCookie)
        .send({
          title: 'Valid title',
          content: 'Content that is long enough.',
          authorUserId: -4,
        })
        .expect(400);
    });

    it('returns 401 without a session cookie', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          title: 'Valid title',
          content: 'Content that is long enough.',
          authorUserId: 4,
        })
        .expect(401);
    });
  });

  describe('GET /posts', () => {
    it('returns paginated posts with meta', async () => {
      const res = await request(app.getHttpServer())
        .get('/posts')
        .set('Cookie', adminCookie)
        .expect(200);

      const body = res.body as GetPostsReponse;
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta.total).toBeGreaterThanOrEqual(1);
      expect(body.meta.page).toBe(1);
      expect(body.meta.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('filters posts by search term', async () => {
      const res = await request(app.getHttpServer())
        .get('/posts?search=first')
        .set('Cookie', adminCookie)
        .expect(200);

      const body = res.body as GetPostsReponse;
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /posts/:id', () => {
    it('returns a single post by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/posts/${createdPostId}`)
        .set('Cookie', adminCookie)
        .expect(200);

      const body = res.body as PostsReponse;
      expect(body.data.id).toBe(createdPostId);
    });

    it('returns 404 for a non-existent post', () => {
      return request(app.getHttpServer())
        .get('/posts/non-existent-id')
        .set('Cookie', adminCookie)
        .expect(404);
    });
  });

  describe('PUT /posts/:id', () => {
    it('updates a post field', async () => {
      const res = await request(app.getHttpServer())
        .put(`/posts/${createdPostId}`)
        .set('Cookie', adminCookie)
        .send({ title: 'Updated title' })
        .expect(200);

      const body = res.body as PostsReponse;
      expect(body.data.title).toBe('Updated title');
    });

    it('returns 400 when content is too short', () => {
      return request(app.getHttpServer())
        .put(`/posts/${createdPostId}`)
        .set('Cookie', adminCookie)
        .send({ content: 'short' })
        .expect(400);
    });

    it('returns 404 when updating a non-existen post', () => {
      return request(app.getHttpServer())
        .put('/post/non-existent-id')
        .set('Cookie', adminCookie)
        .send({ title: 'Updated title' })
        .expect(404);
    });
  });

  describe('DELETE /posts/:id', () => {
    let postToDelete: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', adminCookie)
        .send({
          title: 'Post to delete',
          content: 'Content that is long enough.',
          authorUserId: 4,
        })
        .expect(201);

      const body = res.body as PostsReponse;
      postToDelete = body.data.id;
    });

    it('allows admin to delete a post', () => {
      return request(app.getHttpServer())
        .delete(`/posts/${postToDelete}`)
        .set('Cookie', adminCookie)
        .expect(200);
    });

    it('returns 403 for non-admin users', () => {
      return request(app.getHttpServer())
        .delete(`/posts/${postToDelete}`)
        .set('Cookie', NON_ADMIN_COOKE)
        .expect(403);
    });

    it('returns 404 when deleting a non-existent post', () => {
      return request(app.getHttpServer())
        .delete('/posts/non-existent-id')
        .set('Cookie', adminCookie)
        .expect(404);
    });
  });
});
