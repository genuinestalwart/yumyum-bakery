import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto, CreateOrderedItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { Prisma } from 'prisma/generated/client';
import { OrderResponseUnion, ProxyCartItem } from './orders.types';

const include = {
	orderedItems: { omit: { orderId: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
	constructor(private readonly prismaService: PrismaService) {}

	/**
	 * @throws {BadRequestException} If any of the required fields is missing
	 * based on the orderType
	 */
	async create(
		customerId: string,
		dto: CreateOrderDto,
	): Promise<OrderResponseUnion> {
		const { orderedItems, orderType, subscriptionId, ...location } = dto;

		if (
			(orderType === OrderType.SUBSCRIPTION && !subscriptionId) ||
			(this.needsLocation(orderType) && Object.keys(location).length < 5)
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
				...(this.needsLocation(orderType) && location),
				orderedItems: { create: sanitizedOrderedItems },
				orderType,
				orderStatus: initialStatuses[orderType],
			},
			include,
		});

		return this.serializeOrder(order);
	}

	findAll() {
		return `This action returns all orders`;
	}

	findOne(id: number) {
		return `This action returns a #${id} order`;
	}

	update(id: number, updateOrderDto: UpdateOrderDto) {
		return `This action updates a #${id} order`;
	}

	remove(id: number) {
		return `This action removes a #${id} order`;
	}

	private needsLocation(orderType: OrderType): boolean {
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
		return this.needsLocation(orderType)
			? {
					deliveryCity: deliveryCity!,
					deliveryLatitude: deliveryLatitude!,
					deliveryLongitude: deliveryLongitude!,
					deliveryPostalCode: deliveryPostalCode!,
					deliveryStreet: deliveryStreet!,
				}
			: {};
	}

	private serializeOrder(
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
			riderId: this.needsLocation(order.orderType) ? order.riderId : undefined,
			subscriptionId: isSubscription ? order.subscriptionId! : undefined,
			updatedAt: order.updatedAt,
			verificationCode: !isWalkIn ? order.verificationCode : undefined,
		};
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
