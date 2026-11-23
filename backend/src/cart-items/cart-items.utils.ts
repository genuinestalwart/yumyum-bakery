import { Prisma } from 'prisma/generated/client';
import { CartItemResponseDto } from './dto/cart-item-response.dto';

const select = {
	image: true,
	inStock: true,
	menuCategories: true,
	name: true,
	price: true,
} satisfies Prisma.MenuItemSelect;

export const include = {
	menuItem: { select },
} satisfies Prisma.CartItemInclude;

export const serializeProtectedCartItem = (
	cartItem: Prisma.CartItemGetPayload<{ include: typeof include }>,
): CartItemResponseDto => {
	const { menuItem, ...cartItemRest } = cartItem;
	const { menuCategories: categories, price, ...menuItemRest } = menuItem;
	const rest = { ...cartItemRest, ...menuItemRest };
	return { ...rest, categories, price: price.toFixed(2) };
};
