import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto, CreateOrderedItemDto } from '../dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, OrderType, PaymentStatus } from 'prisma/generated/enums';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { Prisma } from 'prisma/generated/client';
import {
	OrderResponseUnion,
	OrderWithRiderResponseUnion,
	ProxyCartItem,
	SORT_BY,
} from '../orders.types';
import { UsersService } from 'src/users/users.service';
import {
	firstAndLastStatuses,
	include,
	needsToBeDelivered,
	sanitizeOrderStatuses,
	serializeOrder,
} from '../orders.utils';
import { ROLES } from 'src/common/types/roles.types';
import { FindProtectedManyOrdersDto } from '../dto/find-protected-many-orders.dto';
import { toConditionalValue } from 'src/common/utils/conditional.util';
import { getSortOrder } from 'src/common/utils/sort-order.util';
import { createLogger } from 'src/common/utils/logger.util';
const { DELIVERY, PICKUP, SUBSCRIPTION, WALK_IN } = OrderType;

@Injectable()
export class OrdersService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

	private readonly logger = createLogger(OrdersService.name);

	async create(
		customerId: string,
		dto: CreateOrderDto,
		isCustomer: boolean,
	): Promise<OrderResponseUnion> {
		const { orderedItems, orderType, subscriptionId, location } = dto;

		if (
			(orderType === SUBSCRIPTION && !subscriptionId) ||
			(needsToBeDelivered(orderType) && !location) ||
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
				...(needsToBeDelivered(orderType) && location ? location : {}),
				orderedItems: { create: sanitizedOrderedItems },
				orderType,
				orderStatus: firstAndLastStatuses[orderType][0],
			},
			include,
		});

		if (orderType === DELIVERY || orderType === PICKUP) {
			await this.prismaService.cartItem.deleteMany({ where: { customerId } });
		}

		return serializeOrder(isCustomer, order);
	}

	async findProtectedMany(
		customerId: string,
		dto: FindProtectedManyOrdersDto,
		isCustomer: boolean,
	): Promise<OrderResponseUnion[]> {
		const defaultSortBy = dto.sortBy ? SORT_BY[dto.sortBy] : SORT_BY.CREATED_AT;
		const max = dto.maxAmount ?? undefined;
		const min = dto.minAmount ?? undefined;
		const from = dto.fromCreatedAt ?? undefined;
		const to = dto.toCreatedAt ?? undefined;
		const types = dto.types ?? [DELIVERY, PICKUP, SUBSCRIPTION, WALK_IN];
		const { PAID, UNPAID } = PaymentStatus;

		const orders = await this.prismaService.order.findMany({
			include,
			orderBy: { [defaultSortBy]: getSortOrder(dto.sortOrder) },
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

		return orders.map((order) => serializeOrder(isCustomer, order));
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

		return serializeOrder(isCustomer, order);
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
			this.logger.warn(`Rider can't be assigned to this order | ID: ${id}`);
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

		return serializeOrder(false, updatedOrder) as OrderWithRiderResponseUnion;
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
			if (!orderedItems) {
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
