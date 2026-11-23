import { ApiCreateResource } from 'src/common/decorators/swagger.decorators';
import { ROLES } from 'src/common/types/roles.types';
import { ProtectedMenuItemResponseDto } from './dto/protected-menu-item-response.dto';

export const ApiCreateMenuItemResource = () =>
	ApiCreateResource({
		description: `must be a ${ROLES.ADMIN.toUpperCase()} or ${ROLES.MANAGER.toUpperCase()}`,
		type: ProtectedMenuItemResponseDto,
	});
