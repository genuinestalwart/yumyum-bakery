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
	SORT_BY,
} from './orders.types';
import { UsersService } from 'src/users/users.service';
import {
	validateOrderStatus,
	firstAndLastStatuses,
	generateVerificationCode,
	include,
	needsToBeDelivered,
	sanitizeOrderStatuses,
	serializeOrder,
} from './orders.utils';
import { ROLES } from 'src/common/types/roles.types';
import { FindProtectedManyOrdersDto } from './dto/find-protected-many-orders.dto';
import { toConditionalValue } from 'src/common/utils/conditional.util';
import { SORT_ORDER } from 'src/common/types/sorting.types';
const { DELIVERY, PICKUP, SUBSCRIPTION, WALK_IN } = OrderType;

@Injectable()
export class OrdersService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

	async create(
		customerId: string,
		dto: CreateOrderDto,
		isCustomer: boolean,
	): Promise<OrderResponseUnion> {
		const { orderedItems, orderType, subscriptionId, ...location } = dto;

		if (
			(orderType === SUBSCRIPTION && !subscriptionId) ||
			(needsToBeDelivered(orderType) && Object.keys(location).length < 5) ||
			(!isCustomer && orderType !== WALK_IN) ||
			(isCustomer && orderType !== DELIVERY && orderType !== PICKUP)
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

	async findProtectedMany(
		customerId: string,
		dto: FindProtectedManyOrdersDto,
		isCustomer: boolean,
	): Promise<OrderResponseUnion[]> {
		const defaultSortBy = dto.sortBy ?? SORT_BY.CREATED_AT;
		const defaultSortOrder = dto.sortOrder ?? SORT_ORDER.DESC;
		const max = dto.maxAmount ?? undefined;
		const min = dto.minAmount ?? undefined;
		const from = dto.fromCreatedAt ?? undefined;
		const to = dto.toCreatedAt ?? undefined;
		const types = dto.types ?? [DELIVERY, PICKUP, SUBSCRIPTION, WALK_IN];
		const { PAID, UNPAID } = PaymentStatus;

		const orders = await this.prismaService.order.findMany({
			include,
			orderBy: { [defaultSortBy]: [defaultSortOrder] },
			skip: dto.page ? (dto.page - 1) * (dto.limit ?? 20) : 0,
			take: dto.limit ?? 20,
			where: {
				amount:
					!isCustomer && (max || min) ? { gte: min, lte: max } : undefined,
				createdAt: from || to ? { gte: from, lte: to } : undefined,
				customerId: isCustomer ? customerId : dto.customerId,
				orderedItems: dto.menuItems
					? { some: { menuItemId: { in: dto.menuItems } } }
					: undefined,
				orderStatus: dto.statuses
					? { in: sanitizeOrderStatuses(isCustomer, dto.statuses, types) }
					: undefined,
				orderType: dto.types ? { in: dto.types } : undefined,
				riderId: isCustomer ? undefined : dto.riderId,
				paymentStatus: toConditionalValue(dto.isPaid, PAID, UNPAID),
			},
		});

		return orders.map((order) =>
			serializeOrder(isCustomer ? order : { ...order, verificationCode: null }),
		);
	}

	async findProtectedOne(
		customerId: string,
		id: string,
		isCustomer: boolean,
	): Promise<OrderResponseUnion> {
		const order = await this.prismaService.order.findUniqueOrThrow({
			include,
			where: { id, customerId: isCustomer ? customerId : undefined },
		});

		return serializeOrder(
			isCustomer ? order : { ...order, verificationCode: null },
		);
	}

	async updateStatus(
		id: string,
		next: OrderStatus,
	): Promise<OrderResponseUnion> {
		await this.ensureValidStatus(id, next);
		const isReady = next === OrderStatus.READY;
		const code = isReady ? generateVerificationCode() : undefined;
		return this.updateAndSerialize(undefined, id, next, code);
	}

	async cancel(
		customerId: string | undefined,
		id: string,
	): Promise<OrderResponseUnion> {
		const next = OrderStatus.CANCELLED;
		await this.ensureValidStatus(id, next);
		return this.updateAndSerialize(customerId, id, next, undefined);
	}

	async finish(id: string, code?: string) {
		const order = await this.ensureValidStatus(id, 'FINISHED');
		const needsVerification = order.orderType !== OrderType.WALK_IN;

		if (needsVerification && (!code || code !== order.verificationCode)) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		return this.updateAndSerialize(undefined, id, order.next, null);
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

	private async ensureValidStatus(
		id: string,
		status: OrderStatus | 'FINISHED',
	) {
		const order = await this.prismaService.order.findUniqueOrThrow({
			select: {
				orderStatus: true,
				orderType: true,
				paymentStatus: true,
				verificationCode: true,
			},
			where: { id },
		});

		const { orderStatus, orderType, verificationCode } = order;
		const isFinished = status === 'FINISHED';
		const isPaid = order.paymentStatus === PaymentStatus.PAID;
		const next = isFinished ? firstAndLastStatuses[orderType][1] : status;
		const isValidStatus = validateOrderStatus(next, orderStatus, orderType);

		if (!isValidStatus || (isFinished && !isPaid)) {
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		return { next, orderType, verificationCode };
	}

	private async updateAndSerialize(
		customerId: string | undefined,
		id: string,
		orderStatus: OrderStatus,
		verificationCode: string | null | undefined,
	): Promise<OrderResponseUnion> {
		const order = await this.prismaService.order.update({
			data: { orderStatus, verificationCode },
			include,
			where: { customerId, id },
		});

		return serializeOrder({ ...order, verificationCode: null });
	}
}
