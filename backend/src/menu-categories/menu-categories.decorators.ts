import { ApiOkResponse } from '@nestjs/swagger';
import {
	ApiCreateAndConflict,
	ApiUpdateResource,
} from 'src/common/decorators/swagger.decorators';
import { MenuCategoryResponseDto } from './dto/menu-category-response.dto';
import { ROLES } from 'src/common/types/roles.types';

export const ApiCreateMenuCategoryResource = () =>
	ApiCreateAndConflict({
		description: `must be a ${ROLES.ADMIN.toUpperCase()} or ${ROLES.MANAGER.toUpperCase()}`,
		type: MenuCategoryResponseDto,
	});

export const ApiFindPublicManyMenuCategoriesResource = () =>
	ApiOkResponse({ type: [MenuCategoryResponseDto] });

export const ApiUpdateMenuCategoryResource = () =>
	ApiUpdateResource({ type: MenuCategoryResponseDto });
