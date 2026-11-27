import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { SubscriptionDto } from './dto/subscription.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { include } from './subscriptions.utils';
import { Prisma } from 'prisma/generated/client';
import { FindProtectedManySubscriptionsDto } from './dto/find-protected-many-subscriptions.dto';
import { getSortOrder } from 'src/common/utils/sort-order.util';
import { ON_DAYS } from './subscriptions.types';

@Injectable()
export class SubscriptionsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(
		customerId: string,
		dto: SubscriptionDto,
	): Promise<SubscriptionResponseDto> {
		const { subscriptionItems } = dto;
		this.ensureAtLeastOneSlot(dto);

		return this.prismaService.subscription.create({
			data: { customerId, subscriptionItems: { create: subscriptionItems } },
			include,
		});
	}

	async findProtectedMany(
		customerId: string | undefined,
		dto: FindProtectedManySubscriptionsDto,
	): Promise<SubscriptionResponseDto[]> {
		const hasItemFilters = dto.days || dto.menuItems || dto.slots;

		const queryDays = dto.days
			? dto.days.map((day) => ON_DAYS[day])
			: dto.slots
				? Object.values(ON_DAYS)
				: [];

		const dayFilters = queryDays.map((day) => ({
			[day]: dto.slots ? { hasSome: dto.slots } : { isEmpty: false },
		}));

		return this.prismaService.subscription.findMany({
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
	}

	async findProtectedOne(
		id: string,
		customerId?: string,
	): Promise<SubscriptionResponseDto> {
		return this.prismaService.subscription.findUniqueOrThrow({
			include,
			where: { customerId, id },
		});
	}

	async update(
		customerId: string,
		dto: SubscriptionDto,
		id: string,
	): Promise<SubscriptionResponseDto> {
		const { subscriptionItems: newItems } = dto;
		const newMenuItemIds = newItems.map(({ menuItemId }) => menuItemId);
		this.ensureAtLeastOneSlot(dto);

		const { subscriptionItems: oldItems } =
			await this.prismaService.subscription.findUniqueOrThrow({
				select: { subscriptionItems: { select: { menuItemId: true } } },
				where: { customerId, id },
			});

		const itemsToDelete = oldItems
			.filter((item) => !newMenuItemIds.includes(item.menuItemId))
			.map((item) => item.menuItemId);

		return this.updateAndSerialize(
			{
				isActive: false,
				isApproved: false,
				subscriptionItems: {
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
				},
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

	private ensureAtLeastOneSlot(dto: SubscriptionDto) {
		for (const item of dto.subscriptionItems) {
			const hasAtLeastOneSlot = Object.values(item).some(
				(value) => Array.isArray(value) && value.length !== 0,
			);

			if (!hasAtLeastOneSlot) {
				throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
			}
		}
	}

	private async updateAndSerialize(
		data: Prisma.SubscriptionUpdateInput,
		id: string,
	): Promise<SubscriptionResponseDto> {
		return this.prismaService.subscription.update({
			data,
			include,
			where: { id },
		});
	}
}
