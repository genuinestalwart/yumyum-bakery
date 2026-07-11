import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Auth0Module } from './auth0/auth0.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MenuCategoriesModule } from './menu-categories/menu-categories.module';
import { UsersModule } from './users/users.module';

@Module({
	imports: [
		Auth0Module,
		ConfigModule.forRoot({ isGlobal: true }),
		MenuCategoriesModule,
		PrismaModule,
		UsersModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
