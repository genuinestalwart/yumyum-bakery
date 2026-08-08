import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Auth0Module } from 'src/auth0/auth0.module';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [CustomersController],
	imports: [Auth0Module, PrismaModule, UsersModule],
	providers: [CustomersService],
})
export class CustomersModule {}
