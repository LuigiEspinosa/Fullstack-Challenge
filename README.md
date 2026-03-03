# Fullstack Challenge

## Live URLs

- Frontend: <https://fullstack-challenge-tawny.vercel.app>
- Backend: <https://aaw7q5dw4f.execute-api.us-east-2.amazonaws.com>

## Architecture

```mermaid
graph TD
    Browser --> |HTTPS| Vercel[Next.js on Vercel]
    Vercel  --> |REST + httpOnly cookies| Lambda[NestJS on AWS Lambda]
    Lambda  --> |Prisma ORM| RDS[(PostgreSQL on RDS)]
    Vercel  --> |Direct fetch| ReqRes[reqres.in]
    Lambda  --> |Proxy login + import| ReqRes
```

## Instal

```shell
pnpm install
```

## Run Locally

```shell
# Start the local database
docker compose up -d

# Backend setup
cd backend
pnpm prisma generate
pnpm prisma migrate dev

# Back to the root, run both servers in parallel
cd ..
pnpm dev
```

Frontend runs on <http://localhost:3000>, backend on <http://localhost:3001>.

## Run Tests

```shell
# Unit + component tests
pnpm test

# Backend e2e integration tests (requires local DB running)
pnpm test:e2e

# Everything together
pnpm test:all
```

## Deploy

### Backend (AWS Lambda)

```shell
cd backend

# Compile TypeScript and bundle with webpack
pnpm build

# Deploy to AWS via Serverless Framework
# .env.production
# [Backend .env variables](#environmental-variables)
pnpm exec dotenv -e .env.production -- pnpm sls deploy --stage prod

# Run migrations agains RDS (first time deploy)
DATABASE_URL="<rds-connection-string>" pnpm prisma migrate deploy
```

### Frontend (Vercel)

Push to the `main` branch. Vercel auto-deploys on every push.

## Environmental Variables

### Backend

| Variable       | Local value                                               | Production value                               |
| -------------- | --------------------------------------------------------- | ---------------------------------------------- |
| DATABASE_URL   | postgresql://challenge:challenge@localhost:5432/challenge | RDS connection string with ?connection_limit=1 |
| FRONTEND_URL   | <http://localhost:3000>                                   | <https://fullstack-challenge-tawny.vercel.app> |
| NODE_ENV       | development                                               | production                                     |
| REQRES_API_KEY | your key from reqres.io                                   | same key, set in Lambda console                |

### Frontend

| Variable            | Local value             | Production value                                         |
| ------------------- | ----------------------- | -------------------------------------------------------- |
| NEXT_PUBLIC_API_URL | <http://localhost:3001> | <https://aaw7q5dw4f.execute-api.us-east-2.amazonaws.com> |
