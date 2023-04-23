## Development

## Configure environment variables

Create file frontend/.env with the following content:
`cp .env.example .env`

```
DATABASE_URL=postgresql://nymdev:password@localhost:5432/nym
```

### Install dependencies

```
pnpm install
```

### Start the development database

```
pnpm db:start
```

### Run database migrations & Generate Prisma client

_This command is included in `db:start`_

_Note: `prisma migrate dev` includes the `generate command`._

```
pnpm db:migrate
```

### Start the development server

```
pnpm dev
```
