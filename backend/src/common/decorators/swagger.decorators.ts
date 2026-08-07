import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiResponseNoStatusOptions,
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

export const ApiNotFoundAndOk = (options?: ApiResponseNoStatusOptions) => {
	return applyDecorators(
		ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
		ApiOkResponse(options),
	);
};

export const ApiCreateResource = (options?: ApiResponseNoStatusOptions) => {
	return applyDecorators(
		ApiCreatedResponse(options),
		ApiForbiddenAndUnauthorized(),
	);
};

export const ApiCreateAndConflict = (options?: ApiResponseNoStatusOptions) => {
	return applyDecorators(
		ApiConflictResponse({ description: ERROR_MESSAGES.CONFLICT_DUPLICATE }),
		ApiCreateResource(options),
	);
};

export const ApiProtectedManyResource = (
	options?: ApiResponseNoStatusOptions,
) => {
	return applyDecorators(ApiForbiddenAndUnauthorized(), ApiOkResponse(options));
};

export const ApiProtectedOneResource = (
	options?: ApiResponseNoStatusOptions,
) => {
	return applyDecorators(
		ApiForbiddenAndUnauthorized(),
		ApiNotFoundAndOk(options),
	);
};

export const ApiUpdateResource = (options?: ApiResponseNoStatusOptions) =>
	ApiProtectedOneResource(options);

export const ApiUpdateAndConflict = (options?: ApiResponseNoStatusOptions) => {
	return applyDecorators(
		ApiConflictResponse({ description: ERROR_MESSAGES.CONFLICT_STATE }),
		ApiUpdateResource(options),
	);
};

export const ApiDeleteResource = () => {
	return applyDecorators(
		ApiForbiddenAndUnauthorized(),
		ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
		ApiNoContentResponse({ description: 'Resource deleted.' }),
		HttpCode(HttpStatus.NO_CONTENT),
	);
};

export const ApiDeleteAndConflict = () => {
	return applyDecorators(
		ApiConflictResponse({ description: ERROR_MESSAGES.CONFLICT_STATE }),
		ApiDeleteResource(),
	);
};
