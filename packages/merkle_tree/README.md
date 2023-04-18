## Development


### Configure environment variables
Create file merkle_tree/.env with the following content:
```
ALCHEMY_API_KEY={your alchemy api key}
ETHERSCAN_API_KEY={your etherscan api key}
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

### Build The Graph client
```
yarn build
```

### Write latest tree to the database
```
yarn run writeTree
```