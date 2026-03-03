import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import type { Handler, Context, Callback } from 'aws-lambda';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import type { Express } from 'express';

let cachedHandler: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fullstack Challenge API')
    .setDescription('User and Posts Management Portal')
    .setVersion('1.0')
    .addCookieAuth('session')
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: unknown,
  context: Context,
  callback: Callback,
): Promise<unknown> => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }

  return cachedHandler(event, context, callback) as Promise<unknown>;
};
