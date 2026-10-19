import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Requester } from 'src/common/decorators/requester.decorator';
import {
	type Role,
	ROLES,
	type RequestedBy,
} from 'src/common/types/roles.types';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import { ApiGlobalErrors } from 'src/common/decorators/swagger.decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireAuth } from 'src/common/decorators/require-auth.decorator';
import {
	ApiAcceptOrderResource,
	ApiAssignRiderResource,
	ApiCancelOrderResource,
	ApiCreateOrderResource,
	ApiFailOrderResource,
	ApiFinishOrderResource,
	ApiRejectOrderResource,
	ApiUpdateOrderStatusResource,
} from './orders.decorators';
import {
	OrderResponseUnion,
	OrderWithRiderResponseUnion,
} from './orders.types';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { AssignRiderDto } from './dto/assign-rider.dto';
import { FinishOrderDto } from './dto/finish-order.dto';

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

	@ApiAcceptOrderResource()
	@ApiOperation({ summary: 'Accept an order' })
	@Patch(':id/accept')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async accept(@Param('id') id: string): Promise<OrderResponseUnion> {
		return this.ordersService.updateStatus(OrderStatus.ACCEPTED, id);
	}

	@ApiRejectOrderResource()
	@ApiOperation({ summary: 'Reject an order' })
	@Patch(':id/reject')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async reject(@Param('id') id: string): Promise<OrderResponseUnion> {
		return this.ordersService.updateStatus(OrderStatus.REJECTED, id);
	}

	@ApiCancelOrderResource()
	@ApiOperation({ summary: 'Cancel an order' })
	@Patch(':id/cancel')
	@RequireRoles(ROLES.CUSTOMER)
	async cancel(@Param('id') id: string): Promise<OrderResponseUnion> {
		return this.ordersService.updateStatus(OrderStatus.CANCELLED, id);
	}

	@ApiFailOrderResource()
	@ApiOperation({ summary: 'Mark an order as failed' })
	@Patch(':id/fail')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async fail(@Param('id') id: string): Promise<OrderResponseUnion> {
		return this.ordersService.updateStatus(OrderStatus.FAILED, id);
	}

	@ApiUpdateOrderStatusResource()
	@ApiOperation({ summary: 'Update the status of an order' })
	@Patch(':id/update-status')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async updateStatus(
		@Body() body: UpdateOrderStatusDto,
		@Param('id') id: string,
	): Promise<OrderResponseUnion> {
		return this.ordersService.updateStatus(body.orderStatus, id);
	}

	@ApiFinishOrderResource()
	@ApiOperation({ summary: 'Mark an order as finished' })
	@Patch(':id/finish')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async finish(
		@Body() body: FinishOrderDto,
		@Param('id') id: string,
	): Promise<OrderResponseUnion> {
		return this.ordersService.finish(id, body.verificationCode);
	}

	@ApiAssignRiderResource()
	@ApiOperation({ summary: 'Assign rider to an order' })
	@Patch(':id/assign-rider')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async assignRider(
		@Body() body: AssignRiderDto,
		@Param('id') id: string,
	): Promise<OrderWithRiderResponseUnion> {
		return this.ordersService.assignRider(id, body.riderId);
	}
}
