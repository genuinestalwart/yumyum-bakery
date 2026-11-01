import { Prisma } from 'prisma/generated/client';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import { DeliveryOrderResponseDto } from './dto/delivery-order-response.dto';
import { PickupOrderResponseDto } from './dto/pickup-order-response.dto';
import { SubscriptionOrderResponseDto } from './dto/subscription-order-response.dto';
import { WalkInOrderResponseDto } from './dto/walk-in-order-response.dto';
const { ACCEPTED, CANCELLED, FAILED, REJECTED } = OrderStatus;

export interface ProxyCartItem {
	inStock: number;
	menuItemId: string;
	price: Prisma.Decimal;
	quantity: number;
}

export type OrderResponseUnion =
	| DeliveryOrderResponseDto
	| PickupOrderResponseDto
	| SubscriptionOrderResponseDto
	| WalkInOrderResponseDto;

export type OrderWithRiderResponseUnion =
	DeliveryOrderResponseDto | SubscriptionOrderResponseDto;

export const SORT_BY = {
	AMOUNT: 'amount',
	CREATED_AT: 'createdAt',
} as const;

export type SortBy = (typeof SORT_BY)[keyof typeof SORT_BY];

export const QUERY_STATUSES = {
	ACCEPTED,
	CANCELLED,
	FAILED,
	FINISHED: 'FINISHED',
	ONGOING: 'ONGOING',
	REJECTED,
} as const;

export type QueryStatus = (typeof QUERY_STATUSES)[keyof typeof QUERY_STATUSES];
