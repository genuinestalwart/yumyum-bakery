import { Prisma } from 'prisma/generated/client';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import {
	QUERY_STATUSES,
	type QueryStatus,
	type OrderResponseUnion,
} from './orders.types';
const { DELIVERY, PICKUP, SUBSCRIPTION, WALK_IN } = OrderType;

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

export const include = {
	orderedItems: { omit: { orderId: true } },
} satisfies Prisma.OrderInclude;

export const firstAndLastStatuses: Record<OrderType, OrderStatus[]> = {
	[DELIVERY]: [PENDING, DELIVERED],
	[PICKUP]: [PENDING, PICKED_UP],
	[SUBSCRIPTION]: [ACCEPTED, DELIVERED],
	[WALK_IN]: [ACCEPTED, COMPLETED],
} as const;

export const needsToBeDelivered = (orderType: OrderType): boolean => {
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
	const { customerId, riderId, subscriptionId, verificationCode } = order;

	return {
		amount: order.amount.toFixed(2),
		createdAt: order.createdAt,
		...(order.orderType !== WALK_IN && { customerId, verificationCode }),
		...serializeLocation(order),
		id: order.id,
		orderedItems: order.orderedItems.map(({ price, ...rest }) => {
			return { price: price.toFixed(2), ...rest };
		}),
		orderStatus: order.orderStatus,
		orderType: order.orderType,
		paymentStatus: order.paymentStatus,
		...(needsToBeDelivered(order.orderType) && { riderId }),
		...(order.orderType === SUBSCRIPTION && { subscriptionId }),
		updatedAt: order.updatedAt,
	};
};

export const getStatusCycles = (isCustomer: boolean) => {
	const completed = isCustomer ? [] : [COMPLETED];
	const forAllTypes = [ACCEPTED, CANCELLED];
	const forCustomer = [PREPARING, READY, FAILED];
	const forEmployee = [PENDING, REJECTED];
	const forRider = [IN_TRANSIT, DELIVERED];

	return {
		[DELIVERY]: [...forAllTypes, ...forCustomer, ...forEmployee, ...forRider],
		[PICKUP]: [...forAllTypes, ...forCustomer, ...forEmployee, PICKED_UP],
		[SUBSCRIPTION]: [...forAllTypes, ...forCustomer, ...forRider],
		[WALK_IN]: [...completed, ...forAllTypes],
	};
};

export const sanitizeOrderStatuses = (
	isCustomer: boolean,
	statuses: QueryStatus[],
	types: OrderType[],
): OrderStatus[] => {
	const statusCycles = getStatusCycles(isCustomer);

	const sanitizedStatuses: OrderStatus[] = statuses.flatMap((status) => {
		if (status === QUERY_STATUSES.FINISHED) {
			return [...(isCustomer ? [] : [COMPLETED]), DELIVERED, PICKED_UP];
		}

		if (status === QUERY_STATUSES.ONGOING) {
			return [PENDING, PREPARING, READY, IN_TRANSIT];
		}

		return [status];
	});

	const filteredByTypes = [
		...new Set(types.flatMap((orderType) => statusCycles[orderType])),
	];

	return sanitizedStatuses.filter((status) => filteredByTypes.includes(status));
};

export const validateOrderStatus = (
	nextStatus: OrderStatus,
	previousStatus: OrderStatus,
	orderType: OrderType,
): boolean => {
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
