import { HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../types/errors.types';

export const ERROR_MESSAGES = {
	BAD_REQUEST: 'Invalid data provided.',
	CONFLICT_DUPLICATE: 'Resource already exists.',
	CONFLICT_STATE: 'Expected criteria not met.',
	FORBIDDEN: 'Access denied.',
	INTERNAL_SERVER_ERROR: 'An unexpected error occurred.',
	NOT_FOUND: 'Resource not found.',
	UNAUTHORIZED: 'Unauthorized user.',
} as const;

export const FALLBACK_ERROR: ErrorResponse = {
	error: 'Internal Server Error',
	message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
	statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
} as const;
