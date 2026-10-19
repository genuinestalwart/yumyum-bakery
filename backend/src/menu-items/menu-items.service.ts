import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'prisma/generated/client';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { UpdateMenuItemStockDto } from './dto/update-menu-item-stock.dto';
import { ProtectedMenuItemResponseDto } from './dto/protected-menu-item-response.dto';
import { PublicMenuItemResponseDto } from './dto/public-menu-item.response.dto';
import { FindProtectedManyMenuItemsDto } from './dto/find-protected-many-menu-items.dto';
import { FindPublicManyMenuItemsDto } from './dto/find-public-many-menu-items.dto';
import { SORT_BY } from './menu-items.types';
import { SORT_ORDER } from 'src/common/types/sorting.types';
import { createLogger } from 'src/common/utils/logger.util';
import {
	getMenuItemsWhere,
	include,
	omit,
	sanitizeMenuItem,
	serializeProtectedMenuItem,
	serializePublicMenuItem,
	toConditionalValue,
} from './menu-items.utils';

@Injectable()
export class MenuItemsService {
	constructor(private readonly prismaService: PrismaService) {}
	private readonly logger = createLogger(MenuItemsService.name);

	async create(dto: CreateMenuItemDto): Promise<ProtectedMenuItemResponseDto> {
		const menuItem = await this.prismaService.menuItem.create({
			data: sanitizeMenuItem(dto) as Prisma.MenuItemCreateInput,
			include,
		});

		return serializeProtectedMenuItem(menuItem);
	}

	async findProtectedMany(
		dto: FindProtectedManyMenuItemsDto,
	): Promise<ProtectedMenuItemResponseDto[]> {
		const { isArchived, isVisible, ...rest } = dto;

		const menuItems = await this.prismaService.menuItem.findMany({
			include,
			orderBy: { name: 'asc' },
			where: {
				...getMenuItemsWhere(rest),
				archivedAt: toConditionalValue(isArchived, { not: null }, null),
				isVisible,
			},
		});

		return menuItems.map((item) => serializeProtectedMenuItem(item));
	}

	async findPublicMany(
		dto: FindPublicManyMenuItemsDto,
	): Promise<PublicMenuItemResponseDto[]> {
		const { maxPrepTime, minPrepTime } = dto;
		const prepTimeRange = { gte: minPrepTime, lte: maxPrepTime };
		const gte = dto.minPrice ? new Prisma.Decimal(dto.minPrice) : undefined;
		const lte = dto.maxPrice ? new Prisma.Decimal(dto.maxPrice) : undefined;
		const defaultSortBy = dto.sortBy ?? SORT_BY.POPULARITY;
		const defaultSortOrder = dto.sortOrder ?? SORT_ORDER.DESC;

		const menuItems = await this.prismaService.menuItem.findMany({
			include,
			omit,
			orderBy: { [defaultSortBy]: defaultSortOrder },
			where: {
				...getMenuItemsWhere(dto),
				archivedAt: null,
				isVisible: true,
				prepTime: maxPrepTime || minPrepTime ? prepTimeRange : undefined,
				price: gte || lte ? { gte, lte } : undefined,
				publishedAt: { not: null },
			},
		});

		return menuItems.map((item) => serializePublicMenuItem(item));
	}

	async findProtectedOne(id: string): Promise<ProtectedMenuItemResponseDto> {
		const menuItem = await this.prismaService.menuItem.findUniqueOrThrow({
			include,
			where: { id },
		});

		return serializeProtectedMenuItem(menuItem);
	}

	async findPublicOne(id: string): Promise<PublicMenuItemResponseDto> {
		const menuItem = await this.prismaService.menuItem.findUniqueOrThrow({
			include,
			omit,
			where: { id, isVisible: true, publishedAt: { not: null } },
		});

		return serializePublicMenuItem(menuItem);
	}

	async update(
		dto: UpdateMenuItemDto,
		id: string,
	): Promise<ProtectedMenuItemResponseDto> {
		return await this.updateAndSerialize(sanitizeMenuItem(dto), id);
	}

	async updateStock(
		dto: UpdateMenuItemStockDto,
		id: string,
	): Promise<ProtectedMenuItemResponseDto> {
		return await this.updateAndSerialize(dto, id);
	}

	async toggleVisibility(id: string): Promise<ProtectedMenuItemResponseDto> {
		const menuItem = await this.prismaService.menuItem.findUniqueOrThrow({
			select: { isVisible: true, publishedAt: true },
			where: { id },
		});

		const data = {
			isVisible: !menuItem.isVisible,
			publishedAt: !menuItem.publishedAt ? new Date() : undefined,
		} satisfies Prisma.MenuItemUpdateInput;

		return await this.updateAndSerialize(data, id);
	}

	async archive(id: string): Promise<ProtectedMenuItemResponseDto> {
		const { isArchived, isPublished } = await this.getMenuItemStatus(id);

		if (isArchived || !isPublished) {
			this.logger.warn(`Menu Item isn't published and unarchived | ID: ${id}`);
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		return await this.prismaService.$transaction(async (tx) => {
			await tx.cartItem.deleteMany({ where: { menuItemId: id } });
			// implement subscriptionItem removal logic and its consequences here

			const menuItem = await tx.menuItem.update({
				data: { archivedAt: new Date(), inStock: 0, isVisible: false },
				include,
				where: { id },
			});

			return serializeProtectedMenuItem(menuItem);
		});
	}

	async delete(id: string): Promise<void> {
		const timesOrdered = await this.prismaService.orderedItem.count({
			where: { menuItemId: id },
		});

		if (timesOrdered > 0) {
			this.logger.warn(`Menu Item has been ordered once already | ID: ${id}`);
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		await this.prismaService.menuItem.delete({ where: { id } });
	}

	private async getMenuItemStatus(id: string) {
		const menuItem = await this.prismaService.menuItem.findUniqueOrThrow({
			select: { archivedAt: true, publishedAt: true },
			where: { id },
		});

		const { archivedAt, publishedAt } = menuItem;
		return { isArchived: !!archivedAt, isPublished: !!publishedAt };
	}

	private async updateAndSerialize(
		data: Prisma.MenuItemUpdateInput,
		id: string,
	): Promise<ProtectedMenuItemResponseDto> {
		const { isArchived } = await this.getMenuItemStatus(id);

		if (isArchived) {
			this.logger.warn(`Menu Item isn't unarchived | ID: ${id}`);
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		const menuItem = await this.prismaService.menuItem.update({
			data,
			include,
			where: { id },
		});

		return serializeProtectedMenuItem(menuItem);
	}
}
