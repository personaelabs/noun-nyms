# Script to setup the merkle cron job in Render

# 1. Install dependencies for the packages we need
pnpm -F db nym-merkle-cron --prod i && 

# 2. Build in db generates the Prisma artifacts, 
# and build in nym-merkle-cron generates the Graph client
pnpm -F db nym-merkle-cron build

# 3. Run database migrations
# We also run database migrations in Github Actions,
# but we need to run them here as well to ensure that
# the database is up to date before we populate the cache
pnpm -F db run migrate:prod

# 4. Populate database with cache
pnpm -F nym-merkle-tree populateCache