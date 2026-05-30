import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class Auth0ExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		let status: HttpStatus =
			exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';

		if (status === HttpStatus.BAD_REQUEST) {
			message = 'Invalid request';
		} else if (status === HttpStatus.UNAUTHORIZED) {
			message = 'Invalid token';
		} else if (status === HttpStatus.NOT_FOUND) {
			message = 'User not found';
		} else {
			status = HttpStatus.INTERNAL_SERVER_ERROR;
			console.error('Unexpected Error:', exception);
		}

		response.status(status).json({ message });
	}
}
