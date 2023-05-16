## Development

## Configure environment variables

Create file frontend/.env with the following content:
`cp .env.example .env`

```
DATABASE_URL=postgresql://nymdev:password@localhost:5432/nym
```

### Start the development server and database

```
pnpm -F db run start && pnpm dev
```

### Start the development database

```
pnpm db:start
```

### Start the development server with staging database

Make a `.env.staging` file with `DATABASE_URL=<staging_url>`

```
pnpm dev:staging
```

### Run database migrations & Generate Prisma client

_This command is included in `db:start`_

_Note: `prisma migrate dev` includes the `generate command`._

```
pnpm db:migrate
```
