import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
	DocumentBuilder,
	type SwaggerDocumentOptions,
	SwaggerModule,
} from '@nestjs/swagger';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { Auth0ExceptionFilter } from './common/filters/auth0-exception.filter';

const bootstrap = async () => {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.useGlobalFilters(new Auth0ExceptionFilter(), new PrismaExceptionFilter());
	app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

	const config = new DocumentBuilder()
		.addBearerAuth()
		.setTitle('YumYum Bakery APIs')
		.setVersion('v0.4.1')
		.build();

	// .../ControllerName/MethodName
	const options: SwaggerDocumentOptions = {
		operationIdFactory: (controller: string, method: string) => method,
	};

	const document = () => SwaggerModule.createDocument(app, config, options);
	const isDev = process.env.NODE_ENV === 'development';

	SwaggerModule.setup('api', app, document, {
		raw: isDev,
		swaggerOptions: { tagsSorter: 'alpha' },
		ui: isDev,
	});

	await app.listen(process.env.PORT ?? 5000);
};

bootstrap();
