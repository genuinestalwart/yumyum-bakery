import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Auth0Module } from './auth0/auth0.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
	imports: [Auth0Module, PrismaModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
