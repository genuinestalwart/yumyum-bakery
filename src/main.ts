import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
	DocumentBuilder,
	type SwaggerCustomOptions,
	type SwaggerDocumentOptions,
	SwaggerModule,
} from '@nestjs/swagger';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { Auth0ExceptionFilter } from './common/filters/auth0-exception.filter';

const bootstrap = async () => {
	const app = await NestFactory.create(AppModule);
	app.enableCors();

	app.useGlobalFilters(
		new Auth0ExceptionFilter(),
		new PrismaExceptionFilter(),
	);

	app.useGlobalPipes(
		new ValidationPipe({ transform: true, whitelist: true }),
	);

	const config = new DocumentBuilder()
		.addBearerAuth()
		.setTitle('YumYum Bakery APIs')
		.setVersion('0.0.1')
		.build();

	const documentOptions: SwaggerDocumentOptions = {
		operationIdFactory: (controllerName: string, methodName: string) =>
			methodName,
	};

	const documentFactory = () =>
		SwaggerModule.createDocument(app, config, documentOptions);

	const isDev = process.env.NODE_ENV === 'development';
	const customOptions: SwaggerCustomOptions = { ui: isDev, raw: isDev };
	SwaggerModule.setup('api', app, documentFactory, customOptions);
	await app.listen(process.env.PORT ?? 5000);
};

bootstrap();
