import { ApiCreateAndConflict } from 'src/common/decorators/swagger.decorators';
import { MenuCategoryResponseDto } from './dto/menu-category-response.dto';
import { ROLES } from 'src/common/types/roles.types';

export const ApiCreateMenuCategoryResource = () =>
	ApiCreateAndConflict({
		description: `must be a ${ROLES.ADMIN.toUpperCase()} or ${ROLES.MANAGER.toUpperCase()}`,
		type: MenuCategoryResponseDto,
	});
