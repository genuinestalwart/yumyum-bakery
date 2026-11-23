import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewsModule } from 'src/reviews/reviews.module';

@Module({
	controllers: [MenuItemsController],
	exports: [MenuItemsService],
	imports: [PrismaModule, ReviewsModule],
	providers: [MenuItemsService],
})
export class MenuItemsModule {}
