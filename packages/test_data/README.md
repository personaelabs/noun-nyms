# Populate the database with test data

## 1. Start the database

Instructions to start the database can be found [here](../frontend/README.md).

## 2. Run the setup command

This command will not only install the dependencies, but also triggers the `prepare` command, so make sure to run it even if you have already installed the dependencies before.

```
pnpm i
```

## 3. Populate the database with test data

```

pnpm run populate

```

After running the command, run `prisma studio` and you should see the following:
<img width="458" alt="Screenshot 2023-05-04 at 10 16 23" src="https://user-images.githubusercontent.com/36762093/236149664-9226c5cc-8c1c-464d-bdd3-f44eed2e339e.png">

You can add more data by running `pnpm run populate` multiple times.

