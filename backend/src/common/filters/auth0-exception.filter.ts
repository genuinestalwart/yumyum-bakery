import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpStatus,
} from '@nestjs/common';
import { ManagementError } from 'auth0';
import type { Response } from 'express';
import { ErrorResponse } from '../types/errors.types';
import { ERROR_MESSAGES, FALLBACK_ERROR } from '../constants/errors.constants';
import { createLogger } from '../utils/logger.util';

@Catch(ManagementError)
export class Auth0ExceptionFilter implements ExceptionFilter {
	private readonly logger = createLogger(Auth0ExceptionFilter.name);

	catch(exception: ManagementError, host: ArgumentsHost) {
		const errorMapper: Record<string, ErrorResponse> = {
			'400': {
				error: 'Bad Request',
				message: ERROR_MESSAGES.BAD_REQUEST,
				statusCode: HttpStatus.BAD_REQUEST,
			},
			'404': {
				error: 'Not Found',
				message: ERROR_MESSAGES.NOT_FOUND,
				statusCode: HttpStatus.NOT_FOUND,
			},
			'409': {
				error: 'Conflict',
				message: ERROR_MESSAGES.CONFLICT_DUPLICATE,
				statusCode: HttpStatus.CONFLICT,
			},
		};

		const auth0Error = errorMapper[`${exception.statusCode}`] ?? FALLBACK_ERROR;

		if (auth0Error.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
			this.logger.error(`Auth0 Error: ${exception.message}`, exception.stack);
		} else {
			this.logger.warn(`Auth0 Error: ${exception.message}`, exception.stack);
		}

		const response = host.switchToHttp().getResponse<Response>();
		response.status(auth0Error.statusCode).json(auth0Error);
	}
}
