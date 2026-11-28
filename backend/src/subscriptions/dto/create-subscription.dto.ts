import { ScheduleSlot } from 'prisma/generated/enums';
import { CreateOrderedItemDto } from 'src/orders/dto/create-order.dto';
import { IsArrayOfScheduleSlots } from '../subscriptions.decorators';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from 'src/common/dto/location.dto';

export class SubscriptionItemDto extends CreateOrderedItemDto {
	@IsArrayOfScheduleSlots()
	onMondays?: ScheduleSlot[];

	@IsArrayOfScheduleSlots()
	onTuesdays?: ScheduleSlot[];

	@IsArrayOfScheduleSlots()
	onWednesdays?: ScheduleSlot[];

	@IsArrayOfScheduleSlots()
	onThursdays?: ScheduleSlot[];

	@IsArrayOfScheduleSlots()
	onFridays?: ScheduleSlot[];

	@IsArrayOfScheduleSlots()
	onSaturdays?: ScheduleSlot[];

	@IsArrayOfScheduleSlots()
	onSundays?: ScheduleSlot[];
}

export class CreateSubscriptionDto {
	location: LocationDto;

	@IsArray()
	@ArrayNotEmpty()
	@Type(() => SubscriptionItemDto)
	@ValidateNested({ each: true })
	subscriptionItems: SubscriptionItemDto[];
}
