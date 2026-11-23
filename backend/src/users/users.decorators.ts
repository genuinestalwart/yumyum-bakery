import { applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ProtectedUserResponseDto } from './dto/protected-user-response.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { ApiNotFoundAndOk } from 'src/common/decorators/swagger.decorators';

export const ApiProtectedUserResource = () => {
	return applyDecorators(
		ApiNotFoundAndOk({ type: ProtectedUserResponseDto }),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};
