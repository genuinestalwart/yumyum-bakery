import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { OrderType } from 'prisma/generated/enums';
import { OrderResponseDto } from './order-response.dto';

export class PickupOrderResponseDto extends OrderResponseDto {
	@ApiProperty({ type: 'string', nullable: true })
	customerId: string | null;

	@ApiResponseProperty({ example: OrderType.PICKUP })
	orderType: OrderType;

	@ApiProperty({ pattern: /^\d{6}$/, type: 'string', nullable: true })
	verificationCode: string | null;
}
