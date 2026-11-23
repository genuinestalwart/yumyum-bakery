import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseUUIDPipe,
	Query,
	BadRequestException,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { RequireRoles } from 'src/common/decorators/require-roles.decorator';
import { ROLES } from 'src/common/types/roles.types';
import { UpdateMenuItemStockDto } from './dto/update-menu-item-stock.dto';
import { ProtectedMenuItemResponseDto } from './dto/protected-menu-item-response.dto';
import { PublicMenuItemResponseDto } from './dto/public-menu-item.response.dto';
import { FindPublicManyMenuItemsDto } from './dto/find-public-many-menu-items.dto';
import { ApiCreateMenuItemResource } from './menu-items.decorators';
import {
	ApiDeleteAndConflict,
	ApiGlobalErrors,
	ApiNotFoundAndOk,
	ApiUpdateAndConflict,
} from 'src/common/decorators/swagger.decorators';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from 'src/reviews/reviews.service';
import { FindPublicManyReviewsDto } from 'src/reviews/dto/find-public-many-reviews.dto';
import { MenuItemReviewResponseDto } from 'src/reviews/dto/review-response.dto';

@ApiGlobalErrors()
@ApiTags('Menu Items')
@Controller('menu/items')
export class MenuItemsController {
	constructor(
		private readonly menuItemsService: MenuItemsService,
		private readonly reviewsService: ReviewsService,
	) {}

	@ApiCreateMenuItemResource()
	@ApiOperation({ summary: 'Create a new menu item' })
	@Post()
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async create(
		@Body() body: CreateMenuItemDto,
	): Promise<ProtectedMenuItemResponseDto> {
		return this.menuItemsService.create(body);
	}

	@ApiOkResponse({ type: [PublicMenuItemResponseDto] })
	@ApiOperation({ summary: 'Find many public menu items' })
	@Get()
	async findPublicMany(
		@Query() query: FindPublicManyMenuItemsDto,
	): Promise<PublicMenuItemResponseDto[]> {
		return this.menuItemsService.findPublicMany(query);
	}

	@ApiNotFoundAndOk({ type: PublicMenuItemResponseDto })
	@ApiOperation({ summary: 'Find a public menu item' })
	@Get(':id')
	async findPublicOne(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<PublicMenuItemResponseDto> {
		return this.menuItemsService.findPublicOne(id);
	}

	@ApiOkResponse({ type: [MenuItemReviewResponseDto] })
	@ApiOperation({ summary: 'Find many public reviews' })
	@Get(':id/reviews')
	async findPublicManyReviews(
		@Param('id', ParseUUIDPipe) id: string,
		@Query() query: FindPublicManyReviewsDto,
	): Promise<MenuItemReviewResponseDto[]> {
		return this.reviewsService.findPublicManyOfMenuItems(query, id);
	}

	@ApiUpdateAndConflict({ type: ProtectedMenuItemResponseDto })
	@ApiOperation({ summary: 'Update a menu item' })
	@Patch(':id')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async update(
		@Body() body: UpdateMenuItemDto,
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<ProtectedMenuItemResponseDto> {
		if (Object.keys(body).length === 0) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		return this.menuItemsService.update(body, id);
	}

	@ApiUpdateAndConflict({ type: ProtectedMenuItemResponseDto })
	@ApiOperation({ summary: 'Update the stock of a menu item' })
	@Patch(':id/stock')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async updateStock(
		@Body() body: UpdateMenuItemStockDto,
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<ProtectedMenuItemResponseDto> {
		return this.menuItemsService.updateStock(body, id);
	}

	@ApiUpdateAndConflict({ type: ProtectedMenuItemResponseDto })
	@ApiOperation({ summary: 'Toggle the visibility of a menu item' })
	@Patch(':id/toggle-visibility')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
	async toggleVisibility(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<ProtectedMenuItemResponseDto> {
		return this.menuItemsService.toggleVisibility(id);
	}

	@ApiUpdateAndConflict({ type: ProtectedMenuItemResponseDto })
	@ApiOperation({ summary: 'Archive a menu item' })
	@Patch(':id/archive')
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async archive(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<ProtectedMenuItemResponseDto> {
		return this.menuItemsService.archive(id);
	}

	@ApiDeleteAndConflict()
	@ApiOperation({ summary: 'Delete a menu item' })
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.menuItemsService.delete(id);
	}
}
