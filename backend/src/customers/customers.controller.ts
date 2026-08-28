import {
	Controller,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateCustomerEmailDto } from './dto/update-customer-email.dto';
import { ApiUpdateUserResource } from 'src/users/users.decorators';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { ROLES, type RequestedBy } from 'src/common/types/roles.types';
import { Requester } from 'src/common/decorators/requester.decorator';
import { ProtectedUserResponseDto } from 'src/users/dto/protected-user-response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	ApiDeleteAndConflict,
	ApiGlobalErrors,
} from 'src/common/decorators/swagger.decorators';

@ApiGlobalErrors()
@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@ApiOperation({ summary: "Update a CUSTOMER's email address" })
	@ApiUpdateUserResource()
	@Patch('me/email')
	@RequireRoles(ROLES.CUSTOMER)
	async updateEmail(
		@Body() body: UpdateCustomerEmailDto,
		@Requester() requester: RequestedBy,
	): Promise<ProtectedUserResponseDto> {
		return this.customersService.updateEmail(body, requester.id);
	}

	@ApiOperation({ summary: 'Ban a CUSTOMER' })
	@ApiUpdateUserResource()
	@Patch(':id/ban')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async ban(@Param('id') id: string): Promise<ProtectedUserResponseDto> {
		return this.customersService.ban(id);
	}

	@ApiOperation({ summary: 'Unban a CUSTOMER' })
	@ApiUpdateUserResource()
	@Patch(':id/unban')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async unban(@Param('id') id: string): Promise<ProtectedUserResponseDto> {
		return this.customersService.unban(id);
	}

	@ApiDeleteAndConflict()
	@ApiOperation({ summary: 'Delete a CUSTOMER' })
	@Delete('me')
	@HttpCode(HttpStatus.NO_CONTENT)
	@RequireRoles(ROLES.CUSTOMER)
	async delete(@Requester() requester: RequestedBy): Promise<void> {
		await this.customersService.delete(requester.id);
	}
}
