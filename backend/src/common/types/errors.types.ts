import { HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
	error: string;
	message: string;
	statusCode: HttpStatus;
}
