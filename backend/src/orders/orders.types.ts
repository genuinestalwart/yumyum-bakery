import { OrderStatus, Prisma } from 'prisma/generated/client';
import { DeliveryOrderResponseDto } from './dto/delivery-order-response.dto';
import { PickupOrderResponseDto } from './dto/pickup-order-response.dto';
import { SubscriptionOrderResponseDto } from './dto/subscription-order-response.dto';
import { WalkInOrderResponseDto } from './dto/walk-in-order-response.dto';

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

const { PENDING, IN_TRANSIT, ...rest } = OrderStatus;
const { COMPLETED, DELIVERED, PICKED_UP, ...others } = rest;
export type AllowedOrderStatus = (typeof others)[keyof typeof others];
export type SanitizedOrderStatus = (typeof rest)[keyof typeof rest];
