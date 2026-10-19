import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { OrderType } from 'prisma/generated/enums';
import { OrderResponseDto } from './order-response.dto';
import { REGEX_VERIFICATION_CODE } from 'src/common/constants/regex.constants';

export class PickupOrderResponseDto extends OrderResponseDto {
	@ApiProperty({ type: 'string', nullable: true })
	customerId: string | null;

	@ApiResponseProperty({ example: OrderType.PICKUP })
	orderType: OrderType;

	@ApiProperty({
		pattern: REGEX_VERIFICATION_CODE,
		type: 'string',
		nullable: true,
	})
	verificationCode: string | null;
}
