import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseUUIDPipe,
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { ROLES } from 'src/common/types/roles.types';
import { UpdateMenuItemStockDto } from './dto/update-menu-item-stock.dto';

@Controller('menu/items')
export class MenuItemsController {
	constructor(private readonly menuItemsService: MenuItemsService) {}

	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Post()
	async create(@Body() body: CreateMenuItemDto) {
		return this.menuItemsService.createMenuItem(body);
	}

	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Patch(':id')
	async update(
		@Body() body: UpdateMenuItemDto,
		@Param('id', ParseUUIDPipe) id: string,
	) {
		return this.menuItemsService.updateMenuItem(body, id);
	}

	@HasRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	@Patch(':id/stock')
	async updateStock(
		@Body() body: UpdateMenuItemStockDto,
		@Param('id', ParseUUIDPipe) id: string,
	) {
		return this.menuItemsService.updateMenuItemStock(body, id);
	}

	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Patch(':id/publish')
	async publish(@Param('id', ParseUUIDPipe) id: string) {
		return this.menuItemsService.publishMenuItem(id);
	}

	@HasRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	@Patch(':id/toggle-visibility')
	async toggle(@Param('id', ParseUUIDPipe) id: string) {
		return this.menuItemsService.toggleVisibility(id);
	}

	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Patch(':id/archive')
	async archive(@Param('id', ParseUUIDPipe) id: string) {
		return this.menuItemsService.archiveMenuItem(id);
	}

	@Delete(':id')
	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	async delete(@Param('id', ParseUUIDPipe) id: string) {
		await this.menuItemsService.deleteMenuItem(id);
	}
}
