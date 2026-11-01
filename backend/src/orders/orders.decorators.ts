import { applyDecorators } from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiExtraModels,
	ApiOkResponse,
	ApiResponseNoStatusOptions,
	ApiUnauthorizedResponse,
	getSchemaPath,
	ReferenceObject,
} from '@nestjs/swagger';
import { DeliveryOrderResponseDto } from './dto/delivery-order-response.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { PickupOrderResponseDto } from './dto/pickup-order-response.dto';
import { SubscriptionOrderResponseDto } from './dto/subscription-order-response.dto';
import { WalkInOrderResponseDto } from './dto/walk-in-order-response.dto';
import {
	ApiNotFoundAndOk,
	ApiUpdateAndConflict,
} from 'src/common/decorators/swagger.decorators';

const delivery: ReferenceObject = {
	$ref: getSchemaPath(DeliveryOrderResponseDto),
};

const pickup: ReferenceObject = { $ref: getSchemaPath(PickupOrderResponseDto) };

const subscription: ReferenceObject = {
	$ref: getSchemaPath(SubscriptionOrderResponseDto),
};

const walkIn: ReferenceObject = { $ref: getSchemaPath(WalkInOrderResponseDto) };

const options = {
	schema: { oneOf: [delivery, pickup, subscription, walkIn] },
} satisfies ApiResponseNoStatusOptions;

const ApiExtraModelsForOrders = () =>
	ApiExtraModels(
		DeliveryOrderResponseDto,
		PickupOrderResponseDto,
		SubscriptionOrderResponseDto,
		WalkInOrderResponseDto,
	);

export const ApiCreateOrderResource = () => {
	return applyDecorators(
		ApiExtraModelsForOrders(),
		ApiCreatedResponse(options),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};

export const ApiFindProtectedManyOrdersResource = () => {
	return applyDecorators(
		ApiExtraModelsForOrders(),
		ApiOkResponse({
			schema: {
				items: { oneOf: [delivery, pickup, subscription, walkIn] },
				type: 'array',
			},
		}),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};

export const ApiFindProtectedOneOrderResource = () => {
	return applyDecorators(
		ApiExtraModelsForOrders(),
		ApiNotFoundAndOk(options),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};

export const ApiUpdateOrderStatusResource = () => {
	return applyDecorators(
		ApiExtraModelsForOrders(),
		ApiUpdateAndConflict(options),
	);
};

export const ApiAcceptOrderResource = () => ApiUpdateOrderStatusResource();
export const ApiRejectOrderResource = () => ApiUpdateOrderStatusResource();
export const ApiCancelOrderResource = () => ApiUpdateOrderStatusResource();
export const ApiFinishOrderResource = () => ApiUpdateOrderStatusResource();
export const ApiFailOrderResource = () => ApiUpdateOrderStatusResource();

export const ApiAssignRiderResource = () => {
	return applyDecorators(
		ApiExtraModels(DeliveryOrderResponseDto, SubscriptionOrderResponseDto),
		ApiUpdateAndConflict({ schema: { oneOf: [delivery, subscription] } }),
	);
};
