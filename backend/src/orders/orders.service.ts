import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto, CreateOrderedItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { Prisma } from 'prisma/generated/client';
import {
	AllowedOrderStatus,
	OrderResponseUnion,
	ProxyCartItem,
} from './orders.types';
import { OrdersStatusesService } from './order-statuses.service';

const include = {
	orderedItems: { omit: { orderId: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
	constructor(
		private readonly orderStatusesService: OrdersStatusesService,
		private readonly prismaService: PrismaService,
	) {}

	/**
	 * @throws {BadRequestException} If any of the required fields is missing
	 * based on the orderType
	 */
	async create(
		customerId: string,
		dto: CreateOrderDto,
	): Promise<OrderResponseUnion> {
		const { orderedItems, orderType, subscriptionId, ...location } = dto;
		const needsRider = this.orderStatusesService.needsRider(orderType);

		if (
			(orderType === OrderType.SUBSCRIPTION && !subscriptionId) ||
			(needsRider && Object.keys(location).length < 5)
		) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		const sanitizedOrderedItems = await this.sanitizeOrderedItems(
			customerId,
			orderedItems,
			orderType,
		);

		const initialStatuses: Record<OrderType, OrderStatus> = {
			[OrderType.DELIVERY]: OrderStatus.PENDING,
			[OrderType.PICKUP]: OrderStatus.PENDING,
			[OrderType.SUBSCRIPTION]: OrderStatus.ACCEPTED,
			[OrderType.WALK_IN]: OrderStatus.ACCEPTED,
		};

		const order = await this.prismaService.order.create({
			data: {
				amount: sanitizedOrderedItems.reduce(
					(sum, { price, quantity }) => sum.add(price.mul(quantity)),
					new Prisma.Decimal(0),
				),
				customerId: orderType === OrderType.WALK_IN ? undefined : customerId,
				...(needsRider && location),
				orderedItems: { create: sanitizedOrderedItems },
				orderType,
				orderStatus: initialStatuses[orderType],
			},
			include,
		});

		return this.orderStatusesService.serializeOrder(order);
	}

	async updateStatus(
		action: 'FINISHED' | AllowedOrderStatus,
		id: string,
	): Promise<OrderResponseUnion> {
		return this.orderStatusesService.updateStatus(action, id);
	}

	/**
	 * Creates orderedItems from CUSTOMER's cartItems if the order is DELIVERY or PICKUP type
	 * Sanitizes the provided proxyCartItems if the order is WALK_IN or SUBSCRIPTION type
	 *
	 * @throws {BadRequestException} If any of the required fields is missing
	 * based on the orderType
	 */
	private async sanitizeOrderedItems(
		customerId: string,
		orderedItems: CreateOrderedItemDto[] | undefined,
		orderType: OrderType,
	) {
		const { DELIVERY, PICKUP, SUBSCRIPTION, WALK_IN } = OrderType;
		let cartItems: ProxyCartItem[] = [];

		if (orderType === DELIVERY || orderType === PICKUP) {
			const items = await this.prismaService.cartItem.findMany({
				include: { menuItem: { select: { inStock: true, price: true } } },
				omit: { id: true, customerId: true },
				where: { customerId },
			});

			cartItems = items.map((item) => {
				const { menuItem, ...rest } = item;
				return { ...menuItem, ...rest };
			});
		}

		if (orderType === WALK_IN || orderType === SUBSCRIPTION) {
			if (!orderedItems || orderedItems.length === 0) {
				throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
			}

			const items = await this.prismaService.menuItem.findMany({
				select: { id: true, inStock: true, price: true },
				where: { id: { in: orderedItems.map((item) => item.menuItemId) } },
			});

			cartItems = orderedItems.map((orderedItem) => {
				const item = items.find(({ id }) => id === orderedItem.menuItemId);

				if (!item) {
					throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
				}

				return { inStock: item.inStock, ...orderedItem, price: item.price };
			});
		}

		if (cartItems.filter((item) => item.quantity > item.inStock).length > 0) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		return cartItems.map(({ inStock, ...rest }) => rest);
	}
}
