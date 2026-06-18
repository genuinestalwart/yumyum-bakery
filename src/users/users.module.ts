import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Auth0Module } from 'src/auth0/auth0.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [UsersController],
	imports: [Auth0Module, PrismaModule],
	providers: [UsersService],
})
export class UsersModule {}
