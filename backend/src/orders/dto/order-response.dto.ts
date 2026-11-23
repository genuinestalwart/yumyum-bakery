import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { PaymentStatus } from 'prisma/generated/enums';

export class OrderedItemResponseDto {
	@ApiResponseProperty({ format: 'uuid' })
	id: string;

	@ApiResponseProperty({ format: 'uuid' })
	menuItemId: string;

	@ApiResponseProperty({ type: 'string' })
	price: string;

	@ApiProperty({ maximum: 999, minimum: 1, type: 'integer' })
	quantity: number;
}

export class OrderResponseDto {
	@ApiResponseProperty({ type: 'string' })
	amount: string;

	@ApiResponseProperty({ format: 'date-time' })
	createdAt: Date;

	@ApiResponseProperty({ format: 'uuid' })
	id: string;

	orderedItems: OrderedItemResponseDto[];

	@ApiResponseProperty({ enum: Object.values(PaymentStatus) })
	paymentStatus: PaymentStatus;

	@ApiResponseProperty({ format: 'date-time' })
	updatedAt: Date;
}
