import { ApiProperty, ApiResponseProperty, OmitType } from '@nestjs/swagger';

export class ReviewResponseDto {
	@ApiProperty({ type: 'string', nullable: true })
	comment: string | null;

	@ApiResponseProperty({ format: 'date-time' })
	createdAt: Date;

	@ApiResponseProperty({ type: 'string' })
	customerId: string;

	@ApiResponseProperty({ format: 'uuid' })
	id: string;

	@ApiProperty({ type: 'string', nullable: true })
	menuItemId: string | null;

	@ApiProperty({ type: 'string', nullable: true })
	orderId: string | null;

	@ApiProperty({ maximum: 5, minimum: 1, type: 'integer' })
	rating: number;

	@ApiResponseProperty({ format: 'date-time' })
	updatedAt: Date;
}

export class ReviewOfCustomerResponseDto extends OmitType(ReviewResponseDto, [
	'customerId',
] as const) {}

export class MenuItemReviewResponseDto extends OmitType(ReviewResponseDto, [
	'menuItemId',
] as const) {}
