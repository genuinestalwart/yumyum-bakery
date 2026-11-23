import { ApiResponseProperty } from '@nestjs/swagger';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import { OrderResponseDto } from './order-response.dto';
import { getStatusCycles } from '../orders.utils';

export class WalkInOrderResponseDto extends OrderResponseDto {
	@ApiResponseProperty({
		enum: Object.values(getStatusCycles(true)[OrderType.WALK_IN]),
	})
	orderStatus: OrderStatus;

	@ApiResponseProperty({ example: OrderType.WALK_IN })
	orderType: OrderType;
}
