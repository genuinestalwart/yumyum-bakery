import { applyDecorators } from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiExtraModels,
	ApiUnauthorizedResponse,
	getSchemaPath,
} from '@nestjs/swagger';
import { DeliveryOrderResponseDto } from './dto/delivery-order-response.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { PickupOrderResponseDto } from './dto/pickup-order-response.dto';
import { SubscriptionOrderResponseDto } from './dto/subscription-order-response.dto';
import { WalkInOrderResponseDto } from './dto/walk-in-order-response.dto';

export const ApiCreateOrderResource = () => {
	return applyDecorators(
		ApiExtraModels(
			DeliveryOrderResponseDto,
			PickupOrderResponseDto,
			SubscriptionOrderResponseDto,
			WalkInOrderResponseDto,
		),
		ApiCreatedResponse({
			schema: {
				oneOf: [
					{ $ref: getSchemaPath(DeliveryOrderResponseDto) },
					{ $ref: getSchemaPath(PickupOrderResponseDto) },
					{ $ref: getSchemaPath(SubscriptionOrderResponseDto) },
					{ $ref: getSchemaPath(WalkInOrderResponseDto) },
				],
			},
		}),
		ApiUnauthorizedResponse({ description: ERROR_MESSAGES.UNAUTHORIZED }),
	);
};
