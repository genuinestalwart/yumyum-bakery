import { applyDecorators, Type } from '@nestjs/common';
import {
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { FullUserResponseDto } from './dto/full-user-response.dto';
import { PartialUserResponseDto } from './dto/partial-user-response.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';

const ApiForbiddenAndUnauthorized = () => {
	return applyDecorators(
		ApiForbiddenResponse({ description: ERROR_MESSAGES.FORBIDDEN }),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};

const ApiOkAndNotFound = (type: Type<unknown>) => {
	return applyDecorators(
		ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
		ApiOkResponse({ type }),
	);
};

const ApiUserOwnedResponse = () => {
	return applyDecorators(
		ApiOkAndNotFound(FullUserResponseDto),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};

const ApiRoleGuardedResponse = () => {
	return applyDecorators(
		ApiForbiddenAndUnauthorized(),
		ApiOkAndNotFound(FullUserResponseDto),
	);
};

export const ApiCreateUserResponse = () => {
	return applyDecorators(
		ApiConflictResponse({ description: ERROR_MESSAGES.CONFLICT_DUPLICATE }),
		ApiCreatedResponse({
			description: 'must have ADMIN or MANAGER role.',
			type: CreateUserResponseDto,
		}),
		ApiForbiddenAndUnauthorized(),
	);
};

export const ApiFindManyUsersResponse = () => {
	return applyDecorators(
		ApiForbiddenAndUnauthorized(),
		ApiOkResponse({ type: [FullUserResponseDto] }),
	);
};

export const ApiFindFullUserResponse = () => ApiUserOwnedResponse();
export const ApiFindPartialUserResponse = () =>
	ApiOkAndNotFound(PartialUserResponseDto);
export const ApiUpdateUserRoleResponse = () => ApiRoleGuardedResponse();
export const ApiUpdateUserEmailResponse = () => ApiRoleGuardedResponse();
export const ApiUpdateUserProfileResponse = () => ApiUserOwnedResponse();
export const ApiDeactivateUserResponse = () => ApiRoleGuardedResponse();
export const ApiReactivateUserResponse = () => ApiRoleGuardedResponse();
export const ApiBanCustomerResponse = () => ApiRoleGuardedResponse();
export const ApiUnbanCustomerResponse = () => ApiRoleGuardedResponse();

export const ApiDeleteCustomerResponse = () => {
	return applyDecorators(
		ApiConflictResponse({ description: ERROR_MESSAGES.CONFLICT_STATE }),
		ApiForbiddenAndUnauthorized(),
		ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
		ApiNoContentResponse({ description: 'CUSTOMER account deleted.' }),
	);
};
