import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const start = Date.now();
const prisma = new PrismaClient();
const end = Date.now();
console.log(`Prisma client instantiated in ${end - start}ms`);

export default prisma;
