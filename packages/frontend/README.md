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

### Run database migrations
```
yarn prisma migrate dev
```

### Start the development server
```
yarn dev
```
