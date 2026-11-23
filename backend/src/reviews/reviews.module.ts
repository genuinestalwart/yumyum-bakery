import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [ReviewsController],
	exports: [ReviewsService],
	imports: [PrismaModule],
	providers: [ReviewsService],
})
export class ReviewsModule {}
