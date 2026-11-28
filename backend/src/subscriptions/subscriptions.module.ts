import { Module } from '@nestjs/common';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { OrdersModule } from 'src/orders/orders.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ScheduleService } from './services/schedule.service';

@Module({
	controllers: [SubscriptionsController],
	imports: [OrdersModule, PrismaModule],
	providers: [ScheduleService, SubscriptionsService],
})
export class SubscriptionsModule {}
