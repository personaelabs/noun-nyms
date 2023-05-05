## Development

### Configure environment variables

Create file merkle_tree/.env with the following content:

```
ALCHEMY_API_KEY={your alchemy api key}
ETHERSCAN_API_KEY={your etherscan api key}
DATABASE_URL=postgresql://nymdev:password@localhost:5432/nym
```

### Install dependencies and build The Graph client

```
pnpm i
```

### Start the development database

_In nym/_

```
docker-compose up database
```

### Run database migrations & Generate Prisma client

```
pnpm prisma migrate deploy &&
pnpm prisma generate
```

### Populate the database with the cache

```
pnpm run populateCache
```

### Write latest tree to the database

```
pnpm run writeTree
```
