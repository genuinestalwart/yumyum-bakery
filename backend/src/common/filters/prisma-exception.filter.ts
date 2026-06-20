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

@Catch(
	Prisma.PrismaClientInitializationError,
	Prisma.PrismaClientKnownRequestError,
	Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
	catch(
		exception:
			| Prisma.PrismaClientInitializationError
			| Prisma.PrismaClientKnownRequestError
			| Prisma.PrismaClientValidationError,
		host: ArgumentsHost,
	) {
		const response = host.switchToHttp().getResponse<Response>();

		if (!(exception instanceof Prisma.PrismaClientKnownRequestError)) {
			console.error('[Prisma Error]:', exception);
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

		// Translate all prisma errors into 500 except the errors mentioned in 'errorMapper'
		const prismaError = errorMapper[exception.code] ?? FALLBACK_ERROR;

		if (prismaError.statusCode === FALLBACK_ERROR.statusCode) {
			console.error('[Prisma Error]:', exception);
		}

		response.status(prismaError.statusCode).json(prismaError);
	}
}
