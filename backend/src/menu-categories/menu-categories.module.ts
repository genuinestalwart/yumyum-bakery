import { Module } from '@nestjs/common';
import { MenuCategoriesService } from './menu-categories.service';
import { MenuCategoriesController } from './menu-categories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [MenuCategoriesController],
	imports: [PrismaModule],
	providers: [MenuCategoriesService],
})
export class MenuCategoriesModule {}
