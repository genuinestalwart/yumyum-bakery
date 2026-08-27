import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseUUIDPipe,
	Res,
	HttpStatus,
	HttpCode,
} from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import {
	ApiDeleteResource,
	ApiGlobalErrors,
} from 'src/common/decorators/swagger.decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Requester } from 'src/common/decorators/requester.decorator';
import { ROLES, type RequestedBy } from 'src/common/types/roles.types';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import type { Response } from 'express';
import {
	ApiCreateCartItemResource,
	ApiFindProtectedManyCartItemsResource,
	ApiUpdateCartItemResource,
} from './cart-items.decorators';

@ApiGlobalErrors()
@ApiTags('Cart Items')
@Controller('cart')
@RequireRoles(ROLES.CUSTOMER)
export class CartItemsController {
	constructor(private readonly cartItemsService: CartItemsService) {}

	@ApiCreateCartItemResource()
	@ApiOperation({ summary: 'Create a cart item' })
	@Post()
	async create(
		@Body() body: CreateCartItemDto,
		@Requester() requester: RequestedBy,
	): Promise<CartItemResponseDto> {
		return this.cartItemsService.create(requester.id, body);
	}

	@ApiFindProtectedManyCartItemsResource()
	@ApiOperation({ summary: 'Find many protected cart items' })
	@Get()
	async findProtectedMany(
		@Requester() requester: RequestedBy,
	): Promise<CartItemResponseDto[]> {
		return this.cartItemsService.findProtectedMany(requester.id);
	}

	@ApiOperation({ summary: 'Update a cart item' })
	@ApiUpdateCartItemResource()
	@Patch(':id')
	async update(
		@Body() body: UpdateCartItemDto,
		@Param('id', ParseUUIDPipe) id: string,
		@Requester() requester: RequestedBy,
		@Res({ passthrough: true }) response: Response,
	): Promise<CartItemResponseDto | void> {
		const cartItem = await this.cartItemsService.update(requester.id, body, id);

		if (!cartItem) {
			response.status(HttpStatus.NO_CONTENT);
			return;
		}

		return cartItem;
	}

	@ApiDeleteResource()
	@ApiOperation({ summary: 'Delete a cart item' })
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Requester() requester: RequestedBy,
	): Promise<void> {
		await this.cartItemsService.delete(requester.id, id);
	}

	@ApiDeleteResource()
	@ApiOperation({ summary: 'Bulk delete cart items' })
	@Delete()
	@HttpCode(HttpStatus.NO_CONTENT)
	async bulkDelete(@Requester() requester: RequestedBy): Promise<void> {
		await this.cartItemsService.bulkDelete(requester.id);
	}
}
