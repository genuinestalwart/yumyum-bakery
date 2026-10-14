import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { OrderType } from 'prisma/generated/enums';
import { OrderResponseDto } from './order-response.dto';

export class SubscriptionOrderResponseDto extends OrderResponseDto {
	@ApiProperty({ type: 'string', nullable: true })
	customerId: string | null;

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

	@ApiResponseProperty({ example: OrderType.SUBSCRIPTION })
	orderType: OrderType;

	@ApiProperty({ type: 'string', nullable: true })
	riderId: string | null;

	@ApiProperty({ format: 'uuid' })
	subscriptionId: string;

	@ApiProperty({ pattern: /^\d{6}$/, type: 'string', nullable: true })
	verificationCode: string | null;
}
