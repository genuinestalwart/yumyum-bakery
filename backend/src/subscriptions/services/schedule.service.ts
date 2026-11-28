import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WEEK_DAYS, WeekDay } from '../subscriptions.types';
import { OrderType, ScheduleSlot } from 'prisma/generated/enums';
import { createLogger } from 'src/common/utils/logger.util';
import { include, serializeSubscription } from '../subscriptions.utils';
import { Prisma } from 'prisma/generated/client';
import { OrdersService } from 'src/orders/services/orders.service';
import { CreateOrderedItemDto } from 'src/orders/dto/create-order.dto';
import { Cron } from '@nestjs/schedule';
const timeZone = process.env.TIMEZONE ?? 'Asia/Dhaka';
const enabled = process.env.SCHEDULE_ORDERS === 'true' ? true : false;

@Injectable()
export class ScheduleService {
	constructor(
		private readonly ordersService: OrdersService,
		private readonly prismaService: PrismaService,
	) {}
	private readonly logger = createLogger(ScheduleService.name);

	/**
	 * Runs every 30min from 9am to 8:30pm everyday
	 * 1. Checks current time and ensures valid slot
	 * 2. Gets subscriptions with subscriptionItems which have this slot
	 * 3. Schedules orders if any subscriptions found for this slot
	 */
	@Cron('0 */30 9-20 * * *', {
		disabled: !enabled,
		name: 'schedule_orders',
		timeZone,
		waitForCompletion: true,
	})
	async findActiveSubscriptions() {
		const dayAndTime = new Intl.DateTimeFormat('en-US', {
			timeZone,
			weekday: 'long',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		})
			.format(new Date())
			.replace(',', '');

		const day = dayAndTime.split(' ')[0].toUpperCase() as WeekDay;
		const [hour, minute] = dayAndTime.split(' ')[1].split(':');
		const isFullHour = [0, 1, 2].includes(Number(minute));
		const isValidMinute = isFullHour || [30, 31, 32].includes(Number(minute));

		if (Number(hour) < 9 || 20 < Number(hour) || !isValidMinute) {
			this.logger.log(`No valid slot found, skipping | Time: ${dayAndTime}`);
			return;
		}

		const slot = `SLOT_${hour}${isFullHour ? '00' : '30'}` as ScheduleSlot;

		const subscriptions = await this.prismaService.subscription.findMany({
			include,
			where: {
				isActive: true,
				isApproved: true,
				subscriptionItems: { some: { [WEEK_DAYS[day]]: { has: slot } } },
			},
		});

		if (subscriptions.length === 0) {
			this.logger.log(`No subscriptions found, skipping | Time: ${dayAndTime}`);
			return;
		}

		this.logger.log(`Subscriptions found, scheduling | Time: ${dayAndTime}`);
		await this.scheduleOrders(day, slot, subscriptions);
	}

	/**
	 * For each subscription, there can only be 1 order within the last 20 minutes
	 * 1. Gets the latest orders automatically created orders
	 *    within the last 20 minutes from those subscriptions
	 * 2. Excludes subscriptionItems which don't have the current slot
	 *    and which are in the latest order of this subscription
	 * 3. Create an order if any subscriptionItems remain after filtering
	 */
	private async scheduleOrders(
		day: WeekDay,
		slot: ScheduleSlot,
		subscriptions: Prisma.SubscriptionGetPayload<{ include: typeof include }>[],
	) {
		const latestOrders = await this.prismaService.order.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				orderedItems: { select: { menuItemId: true } },
				subscriptionId: true,
			},
			where: {
				orderType: OrderType.SUBSCRIPTION,
				createdAt: { gte: new Date(Date.now() - 1200000) },
				subscriptionId: { in: subscriptions.map(({ id }) => id) },
			},
		});

		for (const subscription of subscriptions) {
			const latestOrder = latestOrders.find(
				(order) => order.subscriptionId === subscription.id,
			);

			const menuItemIds = latestOrder
				? latestOrder.orderedItems.map(({ menuItemId }) => menuItemId)
				: [];

			const orderedItems = subscription.subscriptionItems
				.filter((item) => item[WEEK_DAYS[day]].includes(slot))
				.filter((item) => !menuItemIds.includes(item.menuItemId))
				.map(({ menuItemId, quantity }) => ({ menuItemId, quantity }));

			if (orderedItems.length > 0) {
				await this.createOrder(orderedItems, subscription);
			}
		}
	}

	private async createOrder(
		orderedItems: CreateOrderedItemDto[],
		subscription: Prisma.SubscriptionGetPayload<{ include: typeof include }>,
	) {
		const { customerId, id, location } = serializeSubscription(subscription);
		const orderType = OrderType.SUBSCRIPTION;

		try {
			const order = await this.ordersService.create(
				customerId,
				{ location, orderedItems, orderType, subscriptionId: id },
				false,
			);

			this.logger.log(`Subscription order created | ID: ${order.id}`);
		} catch (error) {
			this.logger.error(
				`Failed to create subscription order | Subscription ID: ${id}`,
				error instanceof Prisma.PrismaClientKnownRequestError
					? error.stack
					: String(error),
			);
		}
	}
}
