import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
	DocumentBuilder,
	SwaggerCustomOptions,
	SwaggerDocumentOptions,
	SwaggerModule,
} from '@nestjs/swagger';

const bootstrap = async () => {
	const app = await NestFactory.create(AppModule);
	app.enableCors();

	app.useGlobalPipes(
		new ValidationPipe({ transform: true, whitelist: true }),
	);

	const config = new DocumentBuilder()
		.addBearerAuth()
		.setTitle('YumYum Bakery APIs')
		.setVersion('0.0.1')
		.build();

	const documentOptions: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) =>
			methodKey,
	};

	const documentFactory = () =>
		SwaggerModule.createDocument(app, config, documentOptions);

	const isDev = process.env.NODE_ENV === 'development';
	const customOptions: SwaggerCustomOptions = { ui: isDev, raw: isDev };
	SwaggerModule.setup('api', app, documentFactory, customOptions);

	await app.listen(process.env.PORT ?? 5000);
};

bootstrap();
