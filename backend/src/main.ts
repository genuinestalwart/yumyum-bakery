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

	// Register exception filters globally
	app.useGlobalFilters(new Auth0ExceptionFilter(), new PrismaExceptionFilter());

	/*
	Enable global validation for all incoming requests:
		- 'whitelist: true' strips out any extra properties not defined in the DTOs
		- 'transform: true' automatically converts raw properties into the desired types defined in the DTOs
	*/
	app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

	// Swagger API Docs builder
	const config = new DocumentBuilder()
		.addBearerAuth()
		.setTitle('YumYum Bakery APIs')
		.setVersion('0.3.0')
		.build();

	// Use only the controller method names for each endpoints (.../ControllerName/MethodName)
	const documentOptions: SwaggerDocumentOptions = {
		operationIdFactory: (controllerName: string, methodName: string) =>
			methodName,
	};

	const documentFactory = () =>
		SwaggerModule.createDocument(app, config, documentOptions);

	// Swagger API Docs will be visible during only development mode
	const isDev = process.env.NODE_ENV === 'development';
	const customOptions: SwaggerCustomOptions = { ui: isDev, raw: isDev };
	SwaggerModule.setup('api', app, documentFactory, customOptions);
	await app.listen(process.env.PORT ?? 5000);
};

bootstrap();
