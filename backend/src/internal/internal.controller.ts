import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { ApiGlobalErrors } from 'src/common/decorators/swagger.decorators';
import { ROLES } from 'src/common/types/roles.types';
import { FindProtectedManyMenuItemsDto } from 'src/menu-items/dto/find-protected-many-menu-items.dto';
import { ProtectedMenuItemResponseDto } from 'src/menu-items/dto/protected-menu-item-response.dto';
import {
	ApiFindProtectedManyMenuItemsResource,
	ApiFindProtectedOneMenuItemResource,
} from 'src/menu-items/menu-items.decorators';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import { FindProtectedManyUsersDto } from 'src/users/dto/find-protected-many-users.dto';
import { ProtectedUserResponseDto } from 'src/users/dto/protected-user-response.dto';
import { ApiFindProtectedManyUsersResource } from 'src/users/users.decorators';
import { UsersService } from 'src/users/users.service';

@ApiGlobalErrors()
@ApiTags('Internal')
@Controller('internal')
export class InternalController {
	constructor(
		private readonly menuItemsService: MenuItemsService,
		private readonly usersService: UsersService,
	) {}

	@ApiFindProtectedManyMenuItemsResource()
	@ApiOperation({ summary: 'Find many protected menu items' })
	@ApiTags('Menu Items')
	@Get('menu/items')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async findProtectedManyMenuItems(
		@Query() query: FindProtectedManyMenuItemsDto,
	): Promise<ProtectedMenuItemResponseDto[]> {
		return this.menuItemsService.findProtectedMany(query);
	}

	@ApiFindProtectedOneMenuItemResource()
	@ApiOperation({ summary: 'Find a protected menu item' })
	@ApiTags('Menu Items')
	@Get('menu/items/:id')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async findProtectedOneMenuItem(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<ProtectedMenuItemResponseDto> {
		return this.menuItemsService.findProtectedOne(id);
	}

	@ApiFindProtectedManyUsersResource()
	@ApiOperation({ summary: 'Find many protected users' })
	@ApiTags('Users')
	@Get('users')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async findProtectedManyUsers(
		@Query() query: FindProtectedManyUsersDto,
	): Promise<ProtectedUserResponseDto[]> {
		return this.usersService.findProtectedMany(query);
	}
}
