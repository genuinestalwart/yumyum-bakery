import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse, ApiOkResponse } from '@nestjs/swagger';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import {
	ApiCreateResource,
	ApiDeleteResource,
	ApiUpdateResource,
} from 'src/common/decorators/swagger.decorators';
import { MenuCategoryResponseDto } from './dto/menu-category-response.dto';
import { ROLES } from 'src/common/types/roles.types';

export const ApiCreateMenuCategoryResource = () =>
	ApiCreateResource(
		`${ROLES.ADMIN} or ${ROLES.MANAGER}`,
		MenuCategoryResponseDto,
	);

export const ApiFindAllMenuCategoriesResource = () =>
	ApiOkResponse({ type: [MenuCategoryResponseDto] });

export const ApiUpdateMenuCategoryResource = () =>
	ApiUpdateResource(MenuCategoryResponseDto);

export const ApiDeleteMenuCategoryResource = () => {
	return applyDecorators(
		ApiConflictResponse({ description: ERROR_MESSAGES.CONFLICT_STATE }),
		ApiDeleteResource(),
	);
};
