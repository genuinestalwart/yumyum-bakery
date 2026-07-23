import { applyDecorators, HttpCode, HttpStatus, Type } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
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

export const ApiForbiddenAndUnauthorized = () => {
	return applyDecorators(
		ApiForbiddenResponse({ description: ERROR_MESSAGES.FORBIDDEN }),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};

export const ApiOkAndNotFound = (type: Type<unknown>) => {
	return applyDecorators(
		ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
		ApiOkResponse({ type }),
	);
};

export const ApiCreateResource = (role: string, type: Type<unknown>) => {
	return applyDecorators(
		ApiCreatedResponse({ description: `must have ${role} role.`, type }),
		ApiForbiddenAndUnauthorized(),
	);
};

export const ApiUpdateResource = (type: Type<unknown>) => {
	return applyDecorators(ApiForbiddenAndUnauthorized(), ApiOkAndNotFound(type));
};

export const ApiDeleteResource = () => {
	return applyDecorators(
		ApiForbiddenAndUnauthorized(),
		ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
		ApiNoContentResponse({ description: 'Resource deleted.' }),
		HttpCode(HttpStatus.NO_CONTENT),
	);
};
