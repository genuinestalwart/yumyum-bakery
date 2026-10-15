import { applyDecorators } from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiExtraModels,
	ApiResponseNoStatusOptions,
	ApiUnauthorizedResponse,
	getSchemaPath,
} from '@nestjs/swagger';
import { DeliveryOrderResponseDto } from './dto/delivery-order-response.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { PickupOrderResponseDto } from './dto/pickup-order-response.dto';
import { SubscriptionOrderResponseDto } from './dto/subscription-order-response.dto';
import { WalkInOrderResponseDto } from './dto/walk-in-order-response.dto';
import { ApiUpdateAndConflict } from 'src/common/decorators/swagger.decorators';

const options = {
	schema: {
		oneOf: [
			{ $ref: getSchemaPath(DeliveryOrderResponseDto) },
			{ $ref: getSchemaPath(PickupOrderResponseDto) },
			{ $ref: getSchemaPath(SubscriptionOrderResponseDto) },
			{ $ref: getSchemaPath(WalkInOrderResponseDto) },
		],
	},
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
