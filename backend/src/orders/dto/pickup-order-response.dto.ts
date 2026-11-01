import { ApiProperty, ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { OrderStatus, OrderType } from 'prisma/generated/enums';
import { OrderResponseDto } from './order-response.dto';
import { REGEX_VERIFICATION_CODE } from 'src/common/constants/regex.constants';
import { getStatusCycles } from '../orders.utils';

export class PickupOrderResponseDto extends OrderResponseDto {
	@ApiProperty({ type: 'string', nullable: true })
	customerId: string | null;

	@ApiResponseProperty({
		enum: Object.values(getStatusCycles(true)[OrderType.PICKUP]),
	})
	orderStatus: OrderStatus;

	@ApiResponseProperty({ example: OrderType.PICKUP })
	orderType: OrderType;

	@ApiProperty({
		pattern: REGEX_VERIFICATION_CODE,
		type: 'string',
		nullable: true,
	})
	verificationCode: string | null;
}
