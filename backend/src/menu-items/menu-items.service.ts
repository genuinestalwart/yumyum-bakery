import {
	BadRequestException,
	ConflictException,
	Injectable,
} from '@nestjs/common';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'prisma/generated/client';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { UpdateMenuItemStockDto } from './dto/update-menu-item-stock.dto';

@Injectable()
export class MenuItemsService {
	constructor(private readonly prismaService: PrismaService) {}

	async createMenuItem(dto: CreateMenuItemDto) {
		const { categories, ...rest } = dto;
		const menuCategories = await this.formatCategories(categories);

		const menuItem = await this.prismaService.menuItem.create({
			data: { ...rest, menuCategories },
			include: { menuCategories: true },
		});

		return this.normalizeMenuItem(menuItem);
	}

	async updateMenuItem(dto: UpdateMenuItemDto, id: string) {
		if (!Object.keys(dto).length) {
			// If the request body is fully empty
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		const { categories, ...rest } = dto;
		const menuCategories = await this.formatCategories(categories);
		return await this.updateAndNormalize({ ...rest, menuCategories }, id);
	}

	async updateMenuItemStock(dto: UpdateMenuItemStockDto, id: string) {
		return await this.updateAndNormalize({ inStock: dto.inStock }, id);
	}

	async publishMenuItem(id: string) {
		const { publishedAt } = await this.prismaService.menuItem.findUniqueOrThrow(
			{ select: { publishedAt: true }, where: { id } },
		);

		if (publishedAt) {
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		return await this.updateAndNormalize(
			{ isVisible: true, publishedAt: new Date() },
			id,
		);
	}

	async toggleVisibility(id: string) {
		const { isVisible } = await this.prismaService.menuItem.findUniqueOrThrow({
			select: { isVisible: true },
			where: { id },
		});

		return await this.updateAndNormalize({ isVisible: !isVisible }, id);
	}

	async archiveMenuItem(id: string) {
		const { archivedAt } = await this.prismaService.menuItem.findUniqueOrThrow({
			select: { archivedAt: true },
			where: { id },
		});

		if (archivedAt) {
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		return await this.prismaService.$transaction(async (tx) => {
			await tx.cartItem.deleteMany({ where: { menuItemId: id } });
			// implement subscriptionItem removal logic and its consequences here

			const menuItem = await tx.menuItem.update({
				data: { archivedAt: new Date(), inStock: 0, isVisible: false },
				include: { menuCategories: true },
				where: { id },
			});

			return this.normalizeMenuItem(menuItem);
		});
	}

	async deleteMenuItem(id: string) {
		const wasOrdered = await this.prismaService.orderedItem.count({
			where: { menuItemId: id },
		});

		if (wasOrdered) {
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		await this.prismaService.menuItem.delete({ where: { id } });
	}

	private normalizeMenuItem(
		menuItem: Prisma.MenuItemGetPayload<{ include: { menuCategories: true } }>,
	) {
		const { menuCategories: categories, ...rest } = menuItem;
		return { ...rest, categories: categories.map((category) => category.name) };
	}

	private async formatCategories(categories: string[] | undefined) {
		if (!categories) {
			return undefined;
		}

		const validCategories = await this.prismaService.menuCategory.count({
			where: { name: { in: categories } },
		});

		if (categories.length !== validCategories) {
			// If all categories provided in the dto are not in the database
			throw new BadRequestException();
		}

		return { connect: categories.map((category) => ({ name: category })) };
	}

	private async updateAndNormalize(
		data: Prisma.MenuItemUpdateInput,
		id: string,
	) {
		const menuItem = await this.prismaService.menuItem.update({
			data,
			include: { menuCategories: true },
			where: { id },
		});

		return this.normalizeMenuItem(menuItem);
	}
}
