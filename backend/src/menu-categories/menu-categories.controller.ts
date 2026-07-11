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
import { MenuCategoriesService } from './menu-categories.service';
import { MenuCategoryDto } from './dto/menu-category.dto';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { ROLES } from 'src/common/types/roles.types';
import { MenuCategoryResponseDto } from './dto/menu-category-response.dto';
import { ApiGlobalErrors } from 'src/common/decorators/swagger.decorators';
import {
	ApiCreateMenuCategoryResource,
	ApiDeleteMenuCategoryResource,
	ApiFindAllMenuCategoriesResource,
	ApiUpdateMenuCategoryResource,
} from './menu-categories.decorators';

@ApiGlobalErrors()
@Controller('menu/categories')
export class MenuCategoriesController {
	constructor(private readonly menuCategoriesService: MenuCategoriesService) {}

	@ApiCreateMenuCategoryResource()
	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Post()
	async create(
		@Body() body: MenuCategoryDto,
	): Promise<MenuCategoryResponseDto> {
		return this.menuCategoriesService.createMenuCategory(body);
	}

	@ApiFindAllMenuCategoriesResource()
	@Get()
	async findAll(): Promise<MenuCategoryResponseDto[]> {
		return this.menuCategoriesService.findAllMenuCategories();
	}

	@ApiUpdateMenuCategoryResource()
	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	@Patch(':id')
	async update(
		@Body() body: MenuCategoryDto,
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<MenuCategoryResponseDto> {
		return this.menuCategoriesService.updateMenuCategory(body, id);
	}

	@ApiDeleteMenuCategoryResource()
	@Delete(':id')
	@HasRoles(ROLES.ADMIN, ROLES.MANAGER)
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		return this.menuCategoriesService.deleteMenuCategory(id);
	}
}
