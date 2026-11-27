import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseUUIDPipe,
	HttpCode,
	HttpStatus,
	Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionDto } from './dto/subscription.dto';
import { Requester } from 'src/common/decorators/requester.decorator';
import { type RequestedBy, ROLES } from 'src/common/types/roles.types';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { RequireAuth } from 'src/common/decorators/require-auth.decorator';
import { FindProtectedManySubscriptionsDto } from './dto/find-protected-many-subscriptions.dto';
import {
	ApiDeleteResource,
	ApiGlobalErrors,
	ApiUpdateResource,
} from 'src/common/decorators/swagger.decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	ApiCreateSubscriptionResource,
	ApiFindProtectedManySubscriptionsResource,
	ApiFindProtectedOneSubscriptionResource,
} from './subscriptions.decorators';

@ApiGlobalErrors()
@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
	constructor(private readonly subscriptionsService: SubscriptionsService) {}

	@ApiCreateSubscriptionResource()
	@ApiOperation({ summary: 'Create a new subscription' })
	@Post()
	@RequireRoles(ROLES.CUSTOMER)
	async create(
		@Body() body: SubscriptionDto,
		@Requester() requester: RequestedBy,
	): Promise<SubscriptionResponseDto> {
		return this.subscriptionsService.create(requester.id, body);
	}

	@ApiFindProtectedManySubscriptionsResource()
	@ApiOperation({ summary: 'Find many protected subscriptions' })
	@Get()
	@RequireAuth()
	async findProtectedMany(
		@Query() query: FindProtectedManySubscriptionsDto,
		@Requester() requester: RequestedBy,
	): Promise<SubscriptionResponseDto[]> {
		const customerId =
			requester.role === ROLES.CUSTOMER ? requester.id : undefined;
		return this.subscriptionsService.findProtectedMany(customerId, query);
	}

	@ApiFindProtectedOneSubscriptionResource()
	@ApiOperation({ summary: 'Find a protected subscription' })
	@Get(':id')
	@RequireAuth()
	async findProtectedOne(
		@Param('id', ParseUUIDPipe) id: string,
		@Requester() requester: RequestedBy,
	): Promise<SubscriptionResponseDto> {
		const customerId =
			requester.role === ROLES.CUSTOMER ? requester.id : undefined;
		return this.subscriptionsService.findProtectedOne(id, customerId);
	}

	@ApiOperation({ summary: 'Update a subscription' })
	@ApiUpdateResource({ type: SubscriptionResponseDto })
	@Patch(':id')
	@RequireRoles(ROLES.CUSTOMER)
	async update(
		@Body() body: SubscriptionDto,
		@Param('id', ParseUUIDPipe) id: string,
		@Requester() requester: RequestedBy,
	): Promise<SubscriptionResponseDto> {
		return this.subscriptionsService.update(requester.id, body, id);
	}

	@ApiOperation({ summary: 'Toggle approval of a subscription' })
	@ApiUpdateResource({ type: SubscriptionResponseDto })
	@Patch(':id/toggle-approval')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async toggleApproval(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<SubscriptionResponseDto> {
		return this.subscriptionsService.toggleApproval(id);
	}

	@ApiOperation({ summary: 'Toggle status of a subscription' })
	@ApiUpdateResource({ type: SubscriptionResponseDto })
	@Patch(':id/toggle-status')
	@RequireRoles(ROLES.CUSTOMER)
	async toggleStatus(
		@Param('id', ParseUUIDPipe) id: string,
		@Requester() requester: RequestedBy,
	): Promise<SubscriptionResponseDto> {
		return this.subscriptionsService.toggleStatus(requester.id, id);
	}

	@ApiDeleteResource()
	@ApiOperation({ summary: 'Delete a subscription' })
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@RequireRoles(ROLES.CUSTOMER)
	async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Requester() requester: RequestedBy,
	): Promise<void> {
		return this.subscriptionsService.delete(requester.id, id);
	}
}
