import { Module } from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { CartItemsController } from './cart-items.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [CartItemsController],
	imports: [PrismaModule],
	providers: [CartItemsService],
})
export class CartItemsModule {}
