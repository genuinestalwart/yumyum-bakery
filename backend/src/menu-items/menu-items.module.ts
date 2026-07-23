import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [MenuItemsController],
	imports: [PrismaModule],
	providers: [MenuItemsService],
})
export class MenuItemsModule {}
