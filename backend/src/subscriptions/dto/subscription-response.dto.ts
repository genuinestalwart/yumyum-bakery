import { ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { ScheduleSlot } from 'prisma/generated/enums';
import { LocationResponseDto } from 'src/common/dto/location-response.dto';
import { OrderedItemResponseDto } from 'src/orders/dto/order-response.dto';

export class SubscriptionItemResponseDto extends OmitType(
	OrderedItemResponseDto,
	['price'] as const,
) {
	@ApiResponseProperty({ enum: Object.values(ScheduleSlot), type: 'array' })
	onMondays: ScheduleSlot[];

	@ApiResponseProperty({ enum: Object.values(ScheduleSlot), type: 'array' })
	onTuesdays: ScheduleSlot[];

	@ApiResponseProperty({ enum: Object.values(ScheduleSlot), type: 'array' })
	onWednesdays: ScheduleSlot[];

	@ApiResponseProperty({ enum: Object.values(ScheduleSlot), type: 'array' })
	onThursdays: ScheduleSlot[];

	@ApiResponseProperty({ enum: Object.values(ScheduleSlot), type: 'array' })
	onFridays: ScheduleSlot[];

	@ApiResponseProperty({ enum: Object.values(ScheduleSlot), type: 'array' })
	onSaturdays: ScheduleSlot[];

	@ApiResponseProperty({ enum: Object.values(ScheduleSlot), type: 'array' })
	onSundays: ScheduleSlot[];
}

export class SubscriptionResponseDto {
	@ApiResponseProperty({ format: 'date-time' })
	createdAt: Date;

	@ApiResponseProperty({ type: 'string' })
	customerId: string;

	@ApiResponseProperty({ format: 'uuid' })
	id: string;

	@ApiResponseProperty({ type: 'boolean' })
	isActive: boolean;

	@ApiResponseProperty({ type: 'boolean' })
	isApproved: boolean;

	location: LocationResponseDto;

	subscriptionItems: SubscriptionItemResponseDto[];

	@ApiResponseProperty({ format: 'date-time' })
	updatedAt: Date;
}
