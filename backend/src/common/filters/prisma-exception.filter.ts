import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from 'prisma/generated/client';
import { ErrorResponse } from '../types/errors.types';
import { ERROR_MESSAGES, FALLBACK_ERROR } from '../constants/errors.constants';
import { createLogger } from '../utils/logger.util';

@Catch(
	Prisma.PrismaClientInitializationError,
	Prisma.PrismaClientKnownRequestError,
	Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
	private readonly logger = createLogger(PrismaExceptionFilter.name);

	catch(
		exception:
			| Prisma.PrismaClientInitializationError
			| Prisma.PrismaClientKnownRequestError
			| Prisma.PrismaClientValidationError,
		host: ArgumentsHost,
	) {
		const response = host.switchToHttp().getResponse<Response>();

		if (!(exception instanceof Prisma.PrismaClientKnownRequestError)) {
			this.logger.error(`Prisma Error: ${exception.message}`, exception.stack);
			response.status(FALLBACK_ERROR.statusCode).json(FALLBACK_ERROR);
			return;
		}

		const errorMapper: Record<string, ErrorResponse> = {
			P2002: {
				error: 'Conflict',
				message: ERROR_MESSAGES.CONFLICT_DUPLICATE,
				statusCode: HttpStatus.CONFLICT,
			},
			P2003: {
				error: 'Bad Request',
				message: ERROR_MESSAGES.BAD_REQUEST,
				statusCode: HttpStatus.BAD_REQUEST,
			},
			P2025: {
				error: 'Not Found',
				message: ERROR_MESSAGES.NOT_FOUND,
				statusCode: HttpStatus.NOT_FOUND,
			},
		};

		const prismaError = errorMapper[exception.code] ?? FALLBACK_ERROR;

		if (prismaError.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
			this.logger.error(`Prisma Error: ${exception.message}`, exception.stack);
		} else {
			this.logger.warn(`Prisma Error: ${exception.message}`, exception.stack);
		}

		response.status(prismaError.statusCode).json(prismaError);
	}
}
