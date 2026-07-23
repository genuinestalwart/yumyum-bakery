import { applyDecorators } from '@nestjs/common';
import {
	ApiConflictResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { FullUserResponseDto } from './dto/full-user-response.dto';
import { PartialUserResponseDto } from './dto/partial-user-response.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import {
	ApiCreateResource,
	ApiDeleteResource,
	ApiForbiddenAndUnauthorized,
	ApiOkAndNotFound,
	ApiUpdateResource,
} from 'src/common/decorators/swagger.decorators';
import { ROLES } from 'src/common/types/roles.types';

const ApiUserOwnedResource = () => {
	return applyDecorators(
		ApiOkAndNotFound(FullUserResponseDto),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};

export const ApiCreateUserResource = () => {
	return applyDecorators(
		ApiConflictResponse({ description: ERROR_MESSAGES.CONFLICT_DUPLICATE }),
		ApiCreateResource(
			`${ROLES.ADMIN} or ${ROLES.MANAGER}`,
			CreateUserResponseDto,
		),
	);
};

export const ApiFindManyUsersResource = () => {
	return applyDecorators(
		ApiForbiddenAndUnauthorized(),
		ApiOkResponse({ type: [FullUserResponseDto] }),
	);
};

export const ApiFindFullUserResource = () => ApiUserOwnedResource();
export const ApiFindPartialUserResource = () =>
	ApiOkAndNotFound(PartialUserResponseDto);
const ApiUpdateUserResource = () => ApiUpdateResource(FullUserResponseDto);
export const ApiUpdateUserRoleResource = () => ApiUpdateUserResource();
export const ApiUpdateUserEmailResource = () => ApiUpdateUserResource();
export const ApiUpdateUserProfileResource = () => ApiUserOwnedResource();
export const ApiDeactivateUserResource = () => ApiUpdateUserResource();
export const ApiReactivateUserResource = () => ApiUpdateUserResource();
export const ApiBanCustomerResource = () => ApiUpdateUserResource();
export const ApiUnbanCustomerResource = () => ApiUpdateUserResource();

export const ApiDeleteCustomerResource = () => {
	return applyDecorators(
		ApiConflictResponse({ description: ERROR_MESSAGES.CONFLICT_STATE }),
		ApiDeleteResource(),
	);
};
