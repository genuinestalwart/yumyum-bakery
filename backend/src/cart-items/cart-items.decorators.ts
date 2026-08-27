import {
	ApiCreateResource,
	ApiDeleteResource,
	ApiProtectedManyResource,
} from 'src/common/decorators/swagger.decorators';
import { ROLES } from 'src/common/types/roles.types';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

export const ApiCreateCartItemResource = () =>
	ApiCreateResource({
		description: `must be a ${ROLES.CUSTOMER.toUpperCase()}`,
		type: CartItemResponseDto,
	});

export const ApiFindProtectedManyCartItemsResource = () =>
	ApiProtectedManyResource({ type: [CartItemResponseDto] });

export const ApiUpdateCartItemResource = () => {
	return applyDecorators(
		ApiDeleteResource(),
		ApiOkResponse({ type: CartItemResponseDto }),
	);
};
