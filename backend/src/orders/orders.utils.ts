import { Prisma } from 'prisma/generated/client';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import { OrderResponseUnion } from './orders.types';

export const include = {
	orderedItems: { omit: { orderId: true } },
} satisfies Prisma.OrderInclude;

export const firstAndLastStatuses: Record<OrderType, OrderStatus[]> = {
	[OrderType.DELIVERY]: [OrderStatus.PENDING, OrderStatus.DELIVERED],
	[OrderType.PICKUP]: [OrderStatus.PENDING, OrderStatus.PICKED_UP],
	[OrderType.SUBSCRIPTION]: [OrderStatus.ACCEPTED, OrderStatus.DELIVERED],
	[OrderType.WALK_IN]: [OrderStatus.ACCEPTED, OrderStatus.COMPLETED],
};

export const needsToBeDelivered = (orderType: OrderType): boolean => {
	const { DELIVERY, SUBSCRIPTION } = OrderType;
	return orderType === DELIVERY || orderType === SUBSCRIPTION;
};

const serializeLocation = (
	order: Prisma.OrderGetPayload<{ include: typeof include }>,
) => {
	const {
		deliveryCity,
		deliveryLatitude,
		deliveryLongitude,
		deliveryPostalCode,
		deliveryStreet,
		orderType,
	} = order;
	return needsToBeDelivered(orderType)
		? {
				deliveryCity: deliveryCity!,
				deliveryLatitude: deliveryLatitude!,
				deliveryLongitude: deliveryLongitude!,
				deliveryPostalCode: deliveryPostalCode!,
				deliveryStreet: deliveryStreet!,
			}
		: {};
};

export const serializeOrder = (
	order: Prisma.OrderGetPayload<{ include: typeof include }>,
): OrderResponseUnion => {
	const isWalkIn = order.orderType === OrderType.WALK_IN;
	const isSubscription = order.orderType === OrderType.SUBSCRIPTION;

	return {
		amount: order.amount.toFixed(2),
		createdAt: order.createdAt,
		customerId: !isWalkIn ? order.customerId : undefined,
		...serializeLocation(order),
		id: order.id,
		orderComment: order.orderComment,
		orderedItems: order.orderedItems.map(({ price, ...rest }) => {
			return { price: price.toFixed(2), ...rest };
		}),
		orderRating: order.orderRating,
		orderStatus: order.orderStatus,
		orderType: order.orderType,
		paymentStatus: order.paymentStatus,
		riderId: needsToBeDelivered(order.orderType) ? order.riderId : undefined,
		subscriptionId: isSubscription ? order.subscriptionId! : undefined,
		updatedAt: order.updatedAt,
		verificationCode: !isWalkIn ? order.verificationCode : undefined,
	};
};

export const ensureValidStatus = (
	nextStatus: OrderStatus,
	previousStatus: OrderStatus,
	orderType: OrderType,
): boolean => {
	const {
		ACCEPTED,
		CANCELLED,
		COMPLETED,
		DELIVERED,
		FAILED,
		IN_TRANSIT,
		PENDING,
		PICKED_UP,
		PREPARING,
		READY,
		REJECTED,
	} = OrderStatus;

	const { DELIVERY, PICKUP, SUBSCRIPTION, WALK_IN } = OrderType;
	const allOrderTypes = [DELIVERY, PICKUP, SUBSCRIPTION, WALK_IN];

	type StatusChain = Partial<
		Record<OrderStatus, Partial<Record<OrderStatus, OrderType[]>>>
	>;

	const statusChain: StatusChain = {
		[ACCEPTED]: { [PENDING]: [DELIVERY, SUBSCRIPTION] },
		[REJECTED]: { [PENDING]: [DELIVERY, SUBSCRIPTION] },
		[COMPLETED]: { [ACCEPTED]: [WALK_IN] },
		[PREPARING]: { [ACCEPTED]: [DELIVERY, PICKUP, SUBSCRIPTION] },
		[READY]: { [PREPARING]: [DELIVERY, PICKUP, SUBSCRIPTION] },
		[PICKED_UP]: { [READY]: [PICKUP] },
		[DELIVERED]: { [IN_TRANSIT]: [DELIVERY, SUBSCRIPTION] },
		[FAILED]: { [IN_TRANSIT]: [DELIVERY, SUBSCRIPTION] },
		[CANCELLED]: { [PENDING]: allOrderTypes, [ACCEPTED]: allOrderTypes },
	};

	const validOrderTypes = statusChain[nextStatus]![previousStatus];
	return validOrderTypes && validOrderTypes.includes(orderType) ? true : false;
};

export const generateVerificationCode = (): string => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};
