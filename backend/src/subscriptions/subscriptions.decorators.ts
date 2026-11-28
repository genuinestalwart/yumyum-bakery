import { applyDecorators } from '@nestjs/common';
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional } from 'class-validator';
import { ScheduleSlot } from 'prisma/generated/enums';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import {
	ApiCreateResource,
	ApiNotFoundAndOk,
} from 'src/common/decorators/swagger.decorators';
import { ROLES } from 'src/common/types/roles.types';
import { ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';

export const IsArrayOfScheduleSlots = () => {
	return applyDecorators(
		IsOptional(),
		IsArray(),
		ArrayNotEmpty(),
		IsEnum(ScheduleSlot, { each: true }),
	);
};

export const ApiCreateSubscriptionResource = () =>
	ApiCreateResource({
		description: `must be a ${ROLES.CUSTOMER.toUpperCase()}`,
		type: SubscriptionResponseDto,
	});

export const ApiFindProtectedManySubscriptionsResource = () => {
	return applyDecorators(
		ApiOkResponse({ type: [SubscriptionResponseDto] }),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};

export const ApiFindProtectedOneSubscriptionResource = () => {
	return applyDecorators(
		ApiNotFoundAndOk({ type: SubscriptionResponseDto }),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};
