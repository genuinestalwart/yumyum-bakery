import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Requester } from 'src/common/decorators/requester.decorator';
import { ROLES, type RequestedBy } from 'src/common/types/roles.types';
import { OrderStatus } from 'prisma/generated/enums';
import { ApiGlobalErrors } from 'src/common/decorators/swagger.decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireAuth } from 'src/common/decorators/require-auth.decorator';
import {
	ApiAcceptOrderResource,
	ApiAssignRiderResource,
	ApiCancelOrderResource,
	ApiCreateOrderResource,
	ApiFailOrderResource,
	ApiFindProtectedManyOrdersResource,
	ApiFindProtectedOneOrderResource,
	ApiFinishOrderResource,
	ApiRejectOrderResource,
	ApiUpdateOrderStatusResource,
} from './orders.decorators';
import type {
	OrderResponseUnion,
	OrderWithRiderResponseUnion,
} from './orders.types';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { AssignRiderDto } from './dto/assign-rider.dto';
import { FinishOrderDto } from './dto/finish-order.dto';
import { FindProtectedManyOrdersDto } from './dto/find-protected-many-orders.dto';

@ApiGlobalErrors()
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@ApiCreateOrderResource()
	@ApiOperation({ summary: 'Create a new order' })
	@Post()
	@RequireAuth()
	async create(
		@Body() body: CreateOrderDto,
		@Requester() requester: RequestedBy,
	): Promise<OrderResponseUnion> {
		const isCustomer = requester.role === ROLES.CUSTOMER;
		return this.ordersService.create(requester.id, body, isCustomer);
	}

	@ApiFindProtectedManyOrdersResource()
	@ApiOperation({ summary: 'Find many protected orders' })
	@Get()
	@RequireAuth()
	async findProtectedMany(
		@Query() query: FindProtectedManyOrdersDto,
		@Requester() requester: RequestedBy,
	): Promise<OrderResponseUnion[]> {
		const isCustomer = requester.role === ROLES.CUSTOMER;

		return this.ordersService.findProtectedMany(
			requester.id,
			query,
			isCustomer,
		);
	}

	@ApiFindProtectedOneOrderResource()
	@ApiOperation({ summary: 'Find a protected order' })
	@Get(':id')
	@RequireAuth()
	async findProtectedOne(
		@Param('id') id: string,
		@Requester() requester: RequestedBy,
	) {
		const isCustomer = requester.role === ROLES.CUSTOMER;
		return this.ordersService.findProtectedOne(requester.id, id, isCustomer);
	}

	@ApiUpdateOrderStatusResource()
	@ApiOperation({ summary: 'Update the status of an order' })
	@Patch(':id/status')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async updateStatus(
		@Body() body: UpdateOrderStatusDto,
		@Param('id') id: string,
	): Promise<OrderResponseUnion> {
		return this.ordersService.updateStatus(id, body.orderStatus);
	}

	@ApiAcceptOrderResource()
	@ApiOperation({ summary: 'Accept an order' })
	@Patch(':id/accept')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async accept(@Param('id') id: string): Promise<OrderResponseUnion> {
		return this.ordersService.updateStatus(id, OrderStatus.ACCEPTED);
	}

	@ApiRejectOrderResource()
	@ApiOperation({ summary: 'Reject an order' })
	@Patch(':id/reject')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async reject(@Param('id') id: string): Promise<OrderResponseUnion> {
		return this.ordersService.updateStatus(id, OrderStatus.REJECTED);
	}

	@ApiFailOrderResource()
	@ApiOperation({ summary: 'Mark an order as failed' })
	@Patch(':id/fail')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async fail(@Param('id') id: string): Promise<OrderResponseUnion> {
		return this.ordersService.updateStatus(id, OrderStatus.FAILED);
	}

	@ApiCancelOrderResource()
	@ApiOperation({ summary: 'Cancel an order' })
	@Patch(':id/cancel')
	@RequireAuth()
	async cancel(
		@Param('id') id: string,
		@Requester() requester: RequestedBy,
	): Promise<OrderResponseUnion> {
		const isCustomer = requester.role === ROLES.CUSTOMER;
		return this.ordersService.cancel(isCustomer ? requester.id : undefined, id);
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
	@Patch(':id/rider')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async assignRider(
		@Body() body: AssignRiderDto,
		@Param('id') id: string,
	): Promise<OrderWithRiderResponseUnion> {
		return this.ordersService.assignRider(id, body.riderId);
	}
}
