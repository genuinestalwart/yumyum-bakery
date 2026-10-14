import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Requester } from 'src/common/decorators/requester.decorator';
import {
	type Role,
	ROLES,
	type RequestedBy,
} from 'src/common/types/roles.types';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { OrderType } from 'prisma/generated/enums';
import { ApiGlobalErrors } from 'src/common/decorators/swagger.decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireAuth } from 'src/common/decorators/require-auth.decorator';
import { ApiCreateOrderResource } from './orders.decorators';
import { OrderResponseUnion } from './orders.types';

@ApiGlobalErrors()
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@ApiCreateOrderResource()
	@ApiOperation({ summary: 'Create an order' })
	@Post()
	@RequireAuth()
	async create(
		@Body() body: CreateOrderDto,
		@Requester() requester: RequestedBy,
	): Promise<OrderResponseUnion> {
		const allowedOrderTypes: Record<Role, OrderType[]> = {
			[ROLES.ADMIN]: [OrderType.WALK_IN],
			[ROLES.CUSTOMER]: [OrderType.PICKUP, OrderType.DELIVERY],
			[ROLES.MANAGER]: [OrderType.WALK_IN],
			[ROLES.STAFF]: [OrderType.WALK_IN],
		};

		if (!allowedOrderTypes[requester.role].includes(body.orderType)) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		return this.ordersService.create(requester.id, body);
	}

	@Get()
	findAll() {
		return this.ordersService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.ordersService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
		return this.ordersService.update(+id, updateOrderDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.ordersService.remove(+id);
	}
}
