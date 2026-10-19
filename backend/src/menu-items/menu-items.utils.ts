import { Prisma } from 'prisma/generated/client';
import { ProtectedMenuItemResponseDto } from './dto/protected-menu-item-response.dto';
import { PublicMenuItemResponseDto } from './dto/public-menu-item.response.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { FindManyMenuItemsDto } from './dto/find-many-menu-items.dto';

export const include = {
	menuCategories: { select: { id: true, name: true } },
} satisfies Prisma.MenuItemInclude;

export const omit = {
	createdAt: true,
	isVisible: true,
} satisfies Prisma.MenuItemOmit;

export const toConditionalValue = <TTrue, TFalse>(
	value: boolean | undefined,
	whenTrue: TTrue,
	whenFalse: TFalse,
): TTrue | TFalse | undefined => {
	return value === undefined ? undefined : value ? whenTrue : whenFalse;
};

export const serializeProtectedMenuItem = (
	menuItem: Prisma.MenuItemGetPayload<{ include: typeof include }>,
): ProtectedMenuItemResponseDto => {
	const { menuCategories: categories, price, ...rest } = menuItem;
	return { ...rest, categories, price: price.toFixed(2) };
};

export const serializePublicMenuItem = (
	menuItem: Prisma.MenuItemGetPayload<{
		include: typeof include;
		omit: typeof omit;
	}>,
): PublicMenuItemResponseDto => {
	const { archivedAt, menuCategories: categories, price, ...rest } = menuItem;

	return {
		...rest,
		categories,
		isArchived: !!archivedAt,
		price: price.toFixed(2),
	};
};

export const sanitizeMenuItem = (dto: Partial<CreateMenuItemDto>) => {
	const { categories, price, ...rest } = dto;

	return {
		...rest,
		price: price ? new Prisma.Decimal(price) : undefined,
		...(categories && {
			menuCategories: { set: categories.map((id) => ({ id })) },
		}),
	} satisfies Prisma.MenuItemUpdateInput;
};

export const getMenuItemsWhere = (dto: FindManyMenuItemsDto) => {
	return {
		...(dto.categories && {
			menuCategories: { some: { name: { in: dto.categories } } },
		}),
		...(dto.search && {
			OR: [
				{ description: { contains: dto.search, mode: 'insensitive' } },
				{ name: { contains: dto.search, mode: 'insensitive' } },
			],
		}),
		inStock: toConditionalValue(dto.isInStock, { not: 0 }, 0),
		isPreOrderOnly: dto.isPreOrderOnly,
	} satisfies Prisma.MenuItemWhereInput;
};
