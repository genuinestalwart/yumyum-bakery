import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { StatusesService } from './services/statuses.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
	controllers: [OrdersController],
	exports: [OrdersService],
	imports: [PrismaModule, UsersModule],
	providers: [OrdersService, StatusesService],
})
export class OrdersModule {}
