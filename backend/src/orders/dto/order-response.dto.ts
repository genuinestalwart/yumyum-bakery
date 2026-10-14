import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from 'prisma/generated/enums';

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

	@ApiProperty({ type: 'string', nullable: true })
	orderComment: string | null;

	orderedItems: OrderedItemResponseDto[];

	@ApiProperty({ maximum: 5, minimum: 1, nullable: true, type: 'integer' })
	orderRating: number | null;

	@ApiResponseProperty({ enum: Object.values(OrderStatus) })
	orderStatus: OrderStatus;

	@ApiResponseProperty({ enum: Object.values(PaymentStatus) })
	paymentStatus: PaymentStatus;

	@ApiResponseProperty({ format: 'date-time' })
	updatedAt: Date;
}
