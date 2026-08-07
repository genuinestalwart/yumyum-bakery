import {
	ApiCreateResource,
	ApiNotFoundAndOk,
	ApiProtectedManyResource,
	ApiProtectedOneResource,
} from 'src/common/decorators/swagger.decorators';
import { ROLES } from 'src/common/types/roles.types';
import { ProtectedMenuItemResponseDto } from './dto/protected-menu-item-response.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { PublicMenuItemResponseDto } from './dto/public-menu-item.response.dto';

export const ApiCreateMenuItemResource = () =>
	ApiCreateResource({
		description: `must be a ${ROLES.ADMIN.toUpperCase()} or ${ROLES.MANAGER.toUpperCase()}`,
		type: ProtectedMenuItemResponseDto,
	});

export const ApiFindProtectedManyMenuItemsResource = () =>
	ApiProtectedManyResource({ type: [ProtectedMenuItemResponseDto] });
export const ApiFindPublicManyMenuItemsResource = () =>
	ApiOkResponse({ type: [PublicMenuItemResponseDto] });
export const ApiFindProtectedOneMenuItemResource = () =>
	ApiProtectedOneResource({ type: ProtectedMenuItemResponseDto });
export const ApiFindPublicOneMenuItemResource = () =>
	ApiNotFoundAndOk({ type: PublicMenuItemResponseDto });
