import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [SubscriptionsController],
	imports: [PrismaModule],
	providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
