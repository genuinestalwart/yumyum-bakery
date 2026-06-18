import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ERROR_MESSAGES } from '../constants/errors.constants';

export const ApiGlobalErrors = () => {
	return applyDecorators(
		ApiBadRequestResponse({ description: ERROR_MESSAGES.BAD_REQUEST }),
		ApiInternalServerErrorResponse({
			description: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
		}),
	);
};
