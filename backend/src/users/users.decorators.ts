import { applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ProtectedUserResponseDto } from './dto/protected-user-response.dto';
import { PublicUserResponseDto } from './dto/public-user-response.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import {
	ApiNotFoundAndOk,
	ApiProtectedManyResource,
	ApiUpdateResource,
} from 'src/common/decorators/swagger.decorators';

const ApiProtectedUserResource = () => {
	return applyDecorators(
		ApiNotFoundAndOk({ type: ProtectedUserResponseDto }),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};

export const ApiFindProtectedManyUsersResource = () =>
	ApiProtectedManyResource({ type: [ProtectedUserResponseDto] });
export const ApiFindProtectedUserResource = () => ApiProtectedUserResource();
export const ApiFindPublicUserResource = () =>
	ApiNotFoundAndOk({ type: PublicUserResponseDto });
export const ApiUpdateUserProfileResource = () => ApiProtectedUserResource();
export const ApiUpdateUserResource = () =>
	ApiUpdateResource({ type: ProtectedUserResponseDto });
