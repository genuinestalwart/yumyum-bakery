import { ApiProperty, ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { DeliveryOrderResponseDto } from './delivery-order-response.dto';
import { OrderType } from 'prisma/generated/enums';

export class SubscriptionOrderResponseDto extends OmitType(
	DeliveryOrderResponseDto,
	['orderType'] as const,
) {
	@ApiResponseProperty({ example: OrderType.SUBSCRIPTION })
	orderType: OrderType;

	@ApiProperty({ format: 'uuid' })
	subscriptionId: string;
}
