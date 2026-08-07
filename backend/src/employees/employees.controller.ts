import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Requester } from 'src/common/decorators/requester.decorator';
import { ROLES, type RequestedBy } from 'src/common/types/roles.types';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { ApiCreateEmployeeResource } from './employees.decorators';
import { ApiUpdateUserResource } from 'src/users/users.decorators';
import { UpdateEmployeeRoleDto } from './dto/update-employee-role.dto';
import { ProtectedUserResponseDto } from 'src/users/dto/protected-user-response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiGlobalErrors } from 'src/common/decorators/swagger.decorators';

@ApiGlobalErrors()
@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
	constructor(private readonly employeesService: EmployeesService) {}

	@ApiCreateEmployeeResource()
	@ApiOperation({ summary: 'Create a new MANAGER or STAFF' })
	@Post()
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	create(
		@Body() body: CreateEmployeeDto,
		@Requester() requester: RequestedBy,
	): Promise<ProtectedUserResponseDto> {
		return this.employeesService.create(body, requester.role);
	}

	@ApiOperation({ summary: "Update a MANAGER or STAFF's role" })
	@ApiUpdateUserResource()
	@Patch(':id/role')
	@RequireRoles(ROLES.ADMIN)
	async updateRole(
		@Body() body: UpdateEmployeeRoleDto,
		@Param('id') id: string,
	): Promise<ProtectedUserResponseDto> {
		return this.employeesService.updateRole(body, id);
	}

	@ApiOperation({ summary: "Deactivate an MANAGER or STAFF's account" })
	@ApiUpdateUserResource()
	@Patch(':id/deactivate')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async deactivate(
		@Param('id') id: string,
		@Requester() requester: RequestedBy,
	): Promise<ProtectedUserResponseDto> {
		return this.employeesService.deactivate(id, requester.role);
	}

	@ApiOperation({ summary: "Reactivate an MANAGER or STAFF's account" })
	@ApiUpdateUserResource()
	@Patch(':id/reactivate')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async reactivate(
		@Param('id') id: string,
		@Requester() requester: RequestedBy,
	): Promise<ProtectedUserResponseDto> {
		return this.employeesService.reactivate(id, requester.role);
	}
}
