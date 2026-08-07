import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Auth0Module } from 'src/auth0/auth0.module';

@Module({
	controllers: [UsersController],
	exports: [UsersService],
	imports: [Auth0Module],
	providers: [UsersService],
})
export class UsersModule {}
