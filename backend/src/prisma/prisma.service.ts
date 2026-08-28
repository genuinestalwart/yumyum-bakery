import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'prisma/generated/client';
import { Injectable, OnModuleInit } from '@nestjs/common';
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor() {
		super({ adapter });
	}

	async onModuleInit() {
		await this.$connect();
	}
}
