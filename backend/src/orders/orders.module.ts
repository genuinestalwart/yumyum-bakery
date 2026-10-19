import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
	controllers: [OrdersController],
	imports: [PrismaModule, UsersModule],
	providers: [OrdersService],
})
export class OrdersModule {}
