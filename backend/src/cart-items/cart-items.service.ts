import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { include, serializeProtectedCartItem } from './cart-items.utils';

@Injectable()
export class CartItemsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(
		customerId: string,
		dto: CreateCartItemDto,
	): Promise<CartItemResponseDto> {
		const { menuItemId } = dto;

		const cartItem = await this.prismaService.cartItem.upsert({
			create: { customerId, menuItemId },
			include,
			update: { quantity: { increment: 1 } },
			where: { customerId_menuItemId: { customerId, menuItemId } },
		});

		return serializeProtectedCartItem(cartItem);
	}

	async findProtectedMany(customerId: string): Promise<CartItemResponseDto[]> {
		const cartItems = await this.prismaService.cartItem.findMany({
			include,
			where: { customerId },
		});

		return cartItems.map((item) => serializeProtectedCartItem(item));
	}

	async update(
		customerId: string,
		dto: UpdateCartItemDto,
		id: string,
	): Promise<CartItemResponseDto | null> {
		return this.prismaService.$transaction(async (tx) => {
			const { menuItem } = await tx.cartItem.findUniqueOrThrow({
				select: { menuItem: { select: { inStock: true } } },
				where: { customerId, id },
			});

			if (dto.quantity > menuItem.inStock) {
				throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
			}

			if (dto.quantity < 1) {
				await tx.cartItem.delete({ where: { customerId, id } });
				return null;
			}

			const cartItem = await tx.cartItem.update({
				data: { quantity: dto.quantity },
				include,
				where: { customerId, id },
			});

			return serializeProtectedCartItem(cartItem);
		});
	}

	async delete(customerId: string, id: string): Promise<void> {
		await this.prismaService.cartItem.delete({ where: { customerId, id } });
	}

	async bulkDelete(customerId: string): Promise<void> {
		await this.prismaService.cartItem.deleteMany({ where: { customerId } });
	}
}
