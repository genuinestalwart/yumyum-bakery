import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Auth0Module } from 'src/auth0/auth0.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { UsersModule } from 'src/users/users.module';

@Module({
	controllers: [CustomersController],
	imports: [Auth0Module, PrismaModule, ReviewsModule, UsersModule],
	providers: [CustomersService],
})
export class CustomersModule {}
