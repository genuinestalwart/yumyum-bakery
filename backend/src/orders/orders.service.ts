import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto, CreateOrderedItemDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, OrderType, PaymentStatus } from 'prisma/generated/enums';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { Prisma } from 'prisma/generated/client';
import {
	OrderResponseUnion,
	OrderWithRiderResponseUnion,
	ProxyCartItem,
} from './orders.types';
import { UsersService } from 'src/users/users.service';
import {
	ensureValidStatus,
	firstAndLastStatuses,
	generateVerificationCode,
	include,
	needsToBeDelivered,
	serializeOrder,
} from './orders.utils';
import { ROLES } from 'src/common/types/roles.types';

@Injectable()
export class OrdersService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

	async create(
		customerId: string,
		dto: CreateOrderDto,
	): Promise<OrderResponseUnion> {
		const { orderedItems, orderType, subscriptionId, ...location } = dto;

		if (
			(orderType === OrderType.SUBSCRIPTION && !subscriptionId) ||
			(needsToBeDelivered(orderType) && Object.keys(location).length < 5)
		) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		const sanitizedOrderedItems = await this.sanitizeOrderedItems(
			customerId,
			orderedItems,
			orderType,
		);

		const order = await this.prismaService.order.create({
			data: {
				amount: sanitizedOrderedItems.reduce(
					(sum, { price, quantity }) => sum.add(price.mul(quantity)),
					new Prisma.Decimal(0),
				),
				customerId: orderType === OrderType.WALK_IN ? undefined : customerId,
				...(needsToBeDelivered(orderType) && location),
				orderedItems: { create: sanitizedOrderedItems },
				orderType,
				orderStatus: firstAndLastStatuses[orderType][0],
			},
			include,
		});

		return serializeOrder(order);
	}

	async updateStatus(
		next: OrderStatus,
		id: string,
	): Promise<OrderResponseUnion> {
		const order = await this.prismaService.order.findUniqueOrThrow({
			select: { orderStatus: true, orderType: true },
			where: { id },
		});

		const { orderStatus: previous, orderType } = order;
		const isValidStatus = ensureValidStatus(next, previous, orderType);
		const code = generateVerificationCode();

		if (!isValidStatus) {
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		const updatedOrder = await this.prismaService.order.update({
			data: {
				orderStatus: next,
				verificationCode: next === OrderStatus.READY ? code : undefined,
			},
			include,
			where: { id },
		});

		return serializeOrder({ ...updatedOrder, verificationCode: null });
	}

	async finish(id: string, code?: string) {
		const order = await this.prismaService.order.findUniqueOrThrow({
			select: {
				orderStatus: true,
				orderType: true,
				paymentStatus: true,
				verificationCode: true,
			},
			where: { id },
		});

		const { orderStatus: previous, orderType } = order;
		const next = firstAndLastStatuses[orderType][1];
		const isValidStatus = ensureValidStatus(next, previous, orderType);
		const needsCode = orderType !== OrderType.WALK_IN;

		if (!isValidStatus || order.paymentStatus !== PaymentStatus.PAID) {
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		if (needsCode && (!code || code !== order.verificationCode)) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		const updatedOrder = await this.prismaService.order.update({
			data: { orderStatus: next, verificationCode: null },
			include,
			where: { id },
		});

		return serializeOrder(updatedOrder);
	}

	async assignRider(
		id: string,
		riderId: string,
	): Promise<OrderWithRiderResponseUnion> {
		const order = await this.prismaService.order.findUniqueOrThrow({
			select: { orderStatus: true, orderType: true },
			where: { id },
		});

		const { orderStatus, orderType } = order;
		const { IN_TRANSIT, READY } = OrderStatus;
		const isValidStatus = orderStatus === READY || orderStatus === IN_TRANSIT;

		if (!needsToBeDelivered(orderType) || !isValidStatus) {
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		const rider = await this.usersService.findProtectedOne(riderId);

		if (!(rider.role === ROLES.MANAGER || rider.role === ROLES.STAFF)) {
			throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
		}

		this.usersService.ensureNotBlocked(rider.blocked, rider.role);

		const updatedOrder = await this.prismaService.order.update({
			data: { orderStatus: IN_TRANSIT, riderId },
			include,
			where: { id },
		});

		return serializeOrder({
			...updatedOrder,
			verificationCode: null,
		}) as OrderWithRiderResponseUnion;
	}

	/**
	 * Creates orderedItems from CUSTOMER's cartItems if the order is DELIVERY or PICKUP type
	 * Sanitizes the provided proxyCartItems if the order is WALK_IN or SUBSCRIPTION type
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
