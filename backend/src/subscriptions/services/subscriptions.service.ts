import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import {
	CreateSubscriptionDto,
	SubscriptionItemDto,
} from '../dto/create-subscription.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionResponseDto } from '../dto/subscription-response.dto';
import { include, serializeSubscription } from '../subscriptions.utils';
import { Prisma } from 'prisma/generated/client';
import { FindProtectedManySubscriptionsDto } from '../dto/find-protected-many-subscriptions.dto';
import { getSortOrder } from 'src/common/utils/sort-order.util';
import { WEEK_DAYS } from '../subscriptions.types';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(
		customerId: string,
		dto: CreateSubscriptionDto,
	): Promise<SubscriptionResponseDto> {
		const { subscriptionItems: items, location } = dto;
		this.ensureAtLeastOneSlot(items);

		const subscription = await this.prismaService.subscription.create({
			data: { customerId, ...location, subscriptionItems: { create: items } },
			include,
		});

		return serializeSubscription(subscription);
	}

	async findProtectedMany(
		customerId: string | undefined,
		dto: FindProtectedManySubscriptionsDto,
	): Promise<SubscriptionResponseDto[]> {
		const hasItemFilters = dto.days || dto.menuItems || dto.slots;

		const queryDays = dto.days
			? dto.days.map((day) => WEEK_DAYS[day])
			: dto.slots
				? Object.values(WEEK_DAYS)
				: [];

		const dayFilters = queryDays.map((day) => ({
			[day]: dto.slots ? { hasSome: dto.slots } : { isEmpty: false },
		}));

		const subscriptions = await this.prismaService.subscription.findMany({
			include,
			orderBy: { createdAt: getSortOrder(dto.sortOrder) },
			where: {
				customerId: customerId ?? dto.customerId,
				isActive: dto.isActive,
				isApproved: dto.isApproved,
				subscriptionItems: hasItemFilters
					? {
							some: {
								...(dto.menuItems && { menuItemId: { in: dto.menuItems } }),
								...(queryDays.length > 0 && { OR: dayFilters }),
							},
						}
					: undefined,
			},
		});

		return subscriptions.map((sub) => serializeSubscription(sub));
	}

	async findProtectedOne(
		id: string,
		customerId?: string,
	): Promise<SubscriptionResponseDto> {
		const sub = await this.prismaService.subscription.findUniqueOrThrow({
			include,
			where: { customerId, id },
		});

		return serializeSubscription(sub);
	}

	async update(
		customerId: string,
		dto: UpdateSubscriptionDto,
		id: string,
	): Promise<SubscriptionResponseDto> {
		const { subscriptionItems: items, location } = dto;

		if (!items && !location) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		const subscriptionItems = items
			? await this.sanitizeSubscriptionItems(customerId, id, items)
			: undefined;

		return this.updateAndSerialize(
			{
				isActive: false,
				isApproved: false,
				...(location ?? {}),
				subscriptionItems,
			},
			id,
		);
	}

	async toggleApproval(id: string): Promise<SubscriptionResponseDto> {
		const { isApproved } =
			await this.prismaService.subscription.findUniqueOrThrow({
				select: { isApproved: true },
				where: { id },
			});

		return this.updateAndSerialize(
			{ isActive: isApproved ? false : undefined, isApproved: !isApproved },
			id,
		);
	}

	async toggleStatus(
		customerId: string,
		id: string,
	): Promise<SubscriptionResponseDto> {
		const { isActive, isApproved } =
			await this.prismaService.subscription.findUniqueOrThrow({
				select: { isActive: true, isApproved: true },
				where: { customerId, id },
			});

		if (!isActive && !isApproved) {
			throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
		}

		return this.updateAndSerialize({ isActive: !isActive }, id);
	}

	async delete(customerId: string, id: string): Promise<void> {
		await this.prismaService.subscription.delete({ where: { customerId, id } });
	}

	private ensureAtLeastOneSlot(items: SubscriptionItemDto[]) {
		for (const item of items) {
			const hasAtLeastOneSlot = Object.values(item).some(
				(value) => Array.isArray(value) && value.length !== 0,
			);

			if (!hasAtLeastOneSlot) {
				throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
			}
		}
	}

	private async sanitizeSubscriptionItems(
		customerId: string,
		id: string,
		newItems: SubscriptionItemDto[],
	): Promise<Prisma.SubscriptionItemUpdateManyWithoutSubscriptionNestedInput> {
		const newMenuItemIds = newItems.map(({ menuItemId }) => menuItemId);
		this.ensureAtLeastOneSlot(newItems);

		const { subscriptionItems: oldItems } =
			await this.prismaService.subscription.findUniqueOrThrow({
				select: { subscriptionItems: { select: { menuItemId: true } } },
				where: { customerId, id },
			});

		const itemsToDelete = oldItems
			.filter((item) => !newMenuItemIds.includes(item.menuItemId))
			.map((item) => item.menuItemId);

		return {
			upsert: newItems.map(({ menuItemId, quantity, ...days }) => ({
				create: { menuItemId, quantity, ...days },
				update: { menuItemId, quantity, ...days },
				where: {
					subscriptionId_menuItemId: { menuItemId, subscriptionId: id },
				},
			})),
			...(itemsToDelete.length > 0 && {
				deleteMany: { menuItemId: { in: itemsToDelete } },
			}),
		};
	}

	private async updateAndSerialize(
		data: Prisma.SubscriptionUpdateInput,
		id: string,
	): Promise<SubscriptionResponseDto> {
		const subscription = await this.prismaService.subscription.update({
			data,
			include,
			where: { id },
		});

		return serializeSubscription(subscription);
	}
}
