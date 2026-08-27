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
} from '@nestjs/common';
import { MenuCategoriesService } from './menu-categories.service';
import { MenuCategoryDto } from './dto/menu-category.dto';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { ROLES } from 'src/common/types/roles.types';
import { MenuCategoryResponseDto } from './dto/menu-category-response.dto';
import {
	ApiDeleteAndConflict,
	ApiGlobalErrors,
} from 'src/common/decorators/swagger.decorators';
import {
	ApiCreateMenuCategoryResource,
	ApiFindPublicManyMenuCategoriesResource,
	ApiUpdateMenuCategoryResource,
} from './menu-categories.decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiGlobalErrors()
@ApiTags('Menu Categories')
@Controller('menu/categories')
export class MenuCategoriesController {
	constructor(private readonly menuCategoriesService: MenuCategoriesService) {}

	@ApiCreateMenuCategoryResource()
	@ApiOperation({ summary: 'Create a new menu category' })
	@Post()
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async create(
		@Body() body: MenuCategoryDto,
	): Promise<MenuCategoryResponseDto> {
		return this.menuCategoriesService.create(body);
	}

	@ApiFindPublicManyMenuCategoriesResource()
	@ApiOperation({ summary: 'Find all menu categories' })
	@Get()
	async findPublicMany(): Promise<MenuCategoryResponseDto[]> {
		return this.menuCategoriesService.findPublicMany();
	}

	@ApiOperation({ summary: 'Update a menu category' })
	@ApiUpdateMenuCategoryResource()
	@Patch(':id')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async update(
		@Body() body: MenuCategoryDto,
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<MenuCategoryResponseDto> {
		return this.menuCategoriesService.update(body, id);
	}

	@ApiDeleteAndConflict()
	@ApiOperation({ summary: 'Delete a menu category' })
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.menuCategoriesService.delete(id);
	}
}
