import { ApiProperty, ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { DeliveryOrderResponseDto } from './delivery-order-response.dto';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import { getStatusCycles } from '../orders.utils';

export class SubscriptionOrderResponseDto extends OmitType(
	DeliveryOrderResponseDto,
	['orderStatus', 'orderType'] as const,
) {
	@ApiResponseProperty({
		enum: Object.values(getStatusCycles(true)[OrderType.SUBSCRIPTION]),
	})
	orderStatus: OrderStatus;

	@ApiResponseProperty({ example: OrderType.SUBSCRIPTION })
	orderType: OrderType;

	@ApiProperty({ format: 'uuid' })
	subscriptionId: string;
}
