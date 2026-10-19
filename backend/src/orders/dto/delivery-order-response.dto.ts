import { ApiProperty, ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { OrderType } from 'prisma/generated/enums';
import { PickupOrderResponseDto } from './pickup-order-response.dto';

export class DeliveryOrderResponseDto extends OmitType(PickupOrderResponseDto, [
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

	@ApiResponseProperty({ example: OrderType.DELIVERY })
	orderType: OrderType;

	@ApiProperty({ type: 'string', nullable: true })
	riderId: string | null;
}
