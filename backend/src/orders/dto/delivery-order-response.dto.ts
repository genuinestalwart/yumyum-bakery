import { ApiProperty, ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import { PickupOrderResponseDto } from './pickup-order-response.dto';
import { getStatusCycles } from '../orders.utils';

export class DeliveryOrderResponseDto extends OmitType(PickupOrderResponseDto, [
	'orderStatus',
	'orderType',
] as const) {
	@ApiResponseProperty({ type: 'string' })
	deliveryCity: string;

	@ApiResponseProperty({ format: 'double' })
	deliveryLatitude: number;

	@ApiResponseProperty({ format: 'double' })
	deliveryLongitude: number;

	@ApiResponseProperty({ type: 'string' })
	deliveryPostalCode: string;

	@ApiResponseProperty({ type: 'string' })
	deliveryStreet: string;

	@ApiResponseProperty({
		enum: Object.values(getStatusCycles(true)[OrderType.DELIVERY]),
	})
	orderStatus: OrderStatus;

	@ApiResponseProperty({ example: OrderType.DELIVERY })
	orderType: OrderType;

	@ApiProperty({ type: 'string', nullable: true })
	riderId: string | null;
}
