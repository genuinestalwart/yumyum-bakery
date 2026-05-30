import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from 'prisma/generated/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
	catch(
		exception: Prisma.PrismaClientKnownRequestError,
		host: ArgumentsHost,
	) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';

		if (exception.code === 'P2025') {
			status = HttpStatus.NOT_FOUND;
			message = 'Not found';
		} else {
			console.error('Unexpected Prisma Error:', exception);
		}

		response.status(status).json({ message, statusCode: status });
	}
}
