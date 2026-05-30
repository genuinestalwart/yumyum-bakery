import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as BaseClient } from 'prisma/generated/client';
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

export class PrismaClient extends BaseClient {
	constructor() {
		super({ adapter });
	}
}
