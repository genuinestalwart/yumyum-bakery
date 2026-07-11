import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { ROLES } from 'src/common/types/roles.types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { RequestedBy } from 'src/common/types/roles.types';
import {
	ApiBanCustomerResource,
	ApiCreateUserResource,
	ApiDeactivateUserResource,
	ApiDeleteCustomerResource,
	ApiFindManyUsersResource,
	ApiFindFullUserResource,
	ApiFindPartialUserResource,
	ApiReactivateUserResource,
	ApiUnbanCustomerResource,
	ApiUpdateUserRoleResource,
	ApiUpdateUserEmailResource,
	ApiUpdateUserProfileResource,
} from './users.decorators';
import { FindManyUsersDto } from './dto/find-many-users.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { ApiGlobalErrors } from 'src/common/decorators/swagger.decorators';
import { FullUserResponseDto } from './dto/full-user-response.dto';
import { RequireAuth } from 'src/common/decorators/require-auth.decorator';
import { PartialUserResponseDto } from './dto/partial-user-response.dto';
import { UpdateUserEmailDto } from './dto/update-user-email.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@ApiGlobalErrors()
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiCreateUserResource()
	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Post()
	async create(
		@Body() body: CreateUserDto,
		@CurrentUser() currentUser: RequestedBy,
	): Promise<CreateUserResponseDto> {
		return this.usersService.createUser(currentUser, body);
	}

	@ApiFindManyUsersResource()
	@Get()
	@HasRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async findMany(
		@Query() query: FindManyUsersDto,
	): Promise<FullUserResponseDto[]> {
		return this.usersService.findManyUsers(query);
	}

	@ApiFindFullUserResource()
	@Get('me')
	@RequireAuth()
	async findMe(
		@CurrentUser() currentUser: RequestedBy,
	): Promise<FullUserResponseDto> {
		return this.usersService.findFullUser(currentUser.id);
	}

	@ApiFindPartialUserResource()
	@Get(':id')
	async findOne(@Param('id') id: string): Promise<PartialUserResponseDto> {
		return this.usersService.findPartialUser(id);
	}

	@ApiUpdateUserRoleResource()
	@HasRoles(ROLES.ADMIN)
	@Patch(':id/role')
	async updateRole(
		@Body() body: UpdateUserRoleDto,
		@Param('id') id: string,
	): Promise<FullUserResponseDto> {
		return this.usersService.updateUserRole(body, id);
	}

	@ApiUpdateUserEmailResource()
	@HasRoles(ROLES.CUSTOMER)
	@Patch('me/email')
	async updateEmail(
		@Body() body: UpdateUserEmailDto,
		@CurrentUser() currentUser: RequestedBy,
	): Promise<FullUserResponseDto> {
		return this.usersService.updateUserEmail(body, currentUser.id);
	}

	@ApiUpdateUserProfileResource()
	@Patch('me/profile')
	@RequireAuth()
	async updateProfile(
		@Body() body: UpdateUserProfileDto,
		@CurrentUser() currentUser: RequestedBy,
	): Promise<FullUserResponseDto> {
		return this.usersService.updateUserProfile(body, currentUser);
	}

	@ApiDeactivateUserResource()
	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Patch(':id/deactivate')
	async deactivate(
		@CurrentUser() currentUser: RequestedBy,
		@Param('id') id: string,
	): Promise<FullUserResponseDto> {
		return this.usersService.deactivateUser(currentUser, id);
	}

	@ApiReactivateUserResource()
	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Patch(':id/reactivate')
	async reactivate(
		@CurrentUser() currentUser: RequestedBy,
		@Param('id') id: string,
	): Promise<FullUserResponseDto> {
		return this.usersService.reactivateUser(currentUser, id);
	}

	@ApiBanCustomerResource()
	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Patch(':id/ban')
	async ban(@Param('id') id: string): Promise<FullUserResponseDto> {
		return this.usersService.banCustomer(id);
	}

	@ApiUnbanCustomerResource()
	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Patch(':id/unban')
	async unban(@Param('id') id: string): Promise<FullUserResponseDto> {
		return this.usersService.unbanCustomer(id);
	}

	@ApiDeleteCustomerResource()
	@Delete('me')
	@HasRoles(ROLES.CUSTOMER)
	async delete(@CurrentUser() currentUser: RequestedBy): Promise<void> {
		await this.usersService.deleteCustomer(currentUser.id);
	}
}
