import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
	AllowedOrderStatus,
	OrderResponseUnion,
	SanitizedOrderStatus,
} from './orders.types';
import { OrderStatus, OrderType, PaymentStatus } from 'prisma/generated/enums';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { Prisma } from 'prisma/generated/client';

const include = {
	orderedItems: { omit: { orderId: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersStatusesService {
	constructor(private readonly prismaService: PrismaService) {}

	/**
	 *
	 * @throws {ConflictException} If the next status is invalid or
	 * if it's the last status but the CUSTOMER hasn't paid yet
	 */
	async updateStatus(
		action: 'FINISHED' | AllowedOrderStatus,
		id: string,
	): Promise<OrderResponseUnion> {
		const order = await this.prismaService.order.findUniqueOrThrow({
			select: { orderStatus: true, orderType: true, paymentStatus: true },
			where: { id },
		});

		const { orderStatus: previous, orderType, paymentStatus } = order;
		const next = this.sanitizeOrderStatus(action, order.orderType);
		const isValidStatus = this.ensureValidStatus(next, previous, orderType);
		const isPaid = paymentStatus === PaymentStatus.PAID;

		if (!isValidStatus || (action === 'FINISHED' && !isPaid)) {
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		const updatedOrder = await this.prismaService.order.update({
			data: { orderStatus: next },
			include: include,
			where: { id },
		});

		return this.serializeOrder(updatedOrder);
	}

	needsRider(orderType: OrderType): boolean {
		const { DELIVERY, SUBSCRIPTION } = OrderType;
		return orderType === DELIVERY || orderType === SUBSCRIPTION;
	}

	private serializeLocation(
		order: Prisma.OrderGetPayload<{ include: typeof include }>,
	) {
		const {
			deliveryCity,
			deliveryLatitude,
			deliveryLongitude,
			deliveryPostalCode,
			deliveryStreet,
			orderType,
		} = order;
		return this.needsRider(orderType)
			? {
					deliveryCity: deliveryCity!,
					deliveryLatitude: deliveryLatitude!,
					deliveryLongitude: deliveryLongitude!,
					deliveryPostalCode: deliveryPostalCode!,
					deliveryStreet: deliveryStreet!,
				}
			: {};
	}

	serializeOrder(
		order: Prisma.OrderGetPayload<{ include: typeof include }>,
	): OrderResponseUnion {
		const isWalkIn = order.orderType === OrderType.WALK_IN;
		const isSubscription = order.orderType === OrderType.SUBSCRIPTION;

		return {
			amount: order.amount.toFixed(2),
			createdAt: order.createdAt,
			customerId: !isWalkIn ? order.customerId : undefined,
			...this.serializeLocation(order),
			id: order.id,
			orderComment: order.orderComment,
			orderedItems: order.orderedItems.map(({ price, ...rest }) => {
				return { price: price.toFixed(2), ...rest };
			}),
			orderRating: order.orderRating,
			orderStatus: order.orderStatus,
			orderType: order.orderType,
			paymentStatus: order.paymentStatus,
			riderId: this.needsRider(order.orderType) ? order.riderId : undefined,
			subscriptionId: isSubscription ? order.subscriptionId! : undefined,
			updatedAt: order.updatedAt,
			verificationCode: !isWalkIn ? order.verificationCode : undefined,
		};
	}

	private sanitizeOrderStatus(
		action: 'FINISHED' | AllowedOrderStatus,
		orderType: OrderType,
	): SanitizedOrderStatus {
		if (action === 'FINISHED') {
			const orderStatuses: Record<OrderType, OrderStatus> = {
				[OrderType.DELIVERY]: OrderStatus.DELIVERED,
				[OrderType.PICKUP]: OrderStatus.PICKED_UP,
				[OrderType.SUBSCRIPTION]: OrderStatus.DELIVERED,
				[OrderType.WALK_IN]: OrderStatus.COMPLETED,
			};

			return orderStatuses[orderType] as SanitizedOrderStatus;
		}

		return action;
	}

	private ensureValidStatus(
		next: SanitizedOrderStatus,
		previous: OrderStatus,
		orderType: OrderType,
	): boolean {
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

		const validTypes = statusChain[next]![previous];
		return validTypes && validTypes.includes(orderType) ? true : false;
	}
}
