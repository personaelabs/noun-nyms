import "dotenv/config";
import csvParser from "csv-parser";
import * as fs from "fs";
import * as path from "path";

import { PrismaClient } from "@prisma/client";

type CachedEOA = {
  address: string;
  pubkey: string;
};

type CachedCode = {
  address: string;
  code: string;
};

const readFile = (filePath: string): Promise<CachedEOA[] | CachedCode[]> =>
  new Promise((resolve, reject) => {
    const result: CachedEOA[] | CachedCode[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row: any) => {
        result.push(row);
      })
      .on("end", () => {
        resolve(result);
      })
      .on("error", () => {
        reject();
      });
  });

const populateCache = async () => {
  const prisma = new PrismaClient();

  const cachedEOAs = await readFile(path.join(__dirname, "cached-eoas.csv"));

  await prisma.cachedEOA.deleteMany();
  await prisma.cachedEOA.createMany({
    data: cachedEOAs.map(row => ({
      address: row.address,
      pubkey: (row as CachedEOA).pubkey
    }))
  });

  const cachedCodes = await readFile(path.join(__dirname, "cached-codes.csv"));

  await prisma.cachedCode.deleteMany();
  await prisma.cachedCode.createMany({
    data: cachedCodes.map(row => ({
      address: row.address,
      code: (row as CachedCode).code
    }))
  });
};

populateCache();
