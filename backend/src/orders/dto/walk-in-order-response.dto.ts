import { ApiResponseProperty } from '@nestjs/swagger';
import { OrderType } from 'prisma/generated/enums';
import { OrderResponseDto } from './order-response.dto';

export class WalkInOrderResponseDto extends OrderResponseDto {
	@ApiResponseProperty({ example: OrderType.WALK_IN })
	orderType: OrderType;
}
