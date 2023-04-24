## Development

## Configure environment variables

Create file frontend/.env with the following content:

```
DATABASE_URL=postgresql://nymdev:password@localhost:5432/nym
```

### Install dependencies

```
yarn
```

### Start the development database

_In nym/_

```
docker-compose up database
```

### Run database migrations & Generate Prisma client

```
yarn prisma migrate deploy &&
yarn prisma generate
```

### Start the development server

```
yarn dev
```
