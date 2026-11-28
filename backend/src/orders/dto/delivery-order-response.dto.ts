import { ApiProperty, ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import { PickupOrderResponseDto } from './pickup-order-response.dto';
import { getStatusCycles } from '../orders.utils';
import { LocationResponseDto } from 'src/common/dto/location-response.dto';

export class DeliveryOrderResponseDto extends OmitType(PickupOrderResponseDto, [
	'orderStatus',
	'orderType',
] as const) {
	location: LocationResponseDto;

	@ApiResponseProperty({
		enum: Object.values(getStatusCycles(true)[OrderType.DELIVERY]),
	})
	orderStatus: OrderStatus;

	@ApiResponseProperty({ example: OrderType.DELIVERY })
	orderType: OrderType;

	@ApiProperty({ type: 'string', nullable: true })
	riderId: string | null;
}
