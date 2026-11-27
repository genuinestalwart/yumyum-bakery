import { ScheduleSlot } from 'prisma/generated/enums';
import { CreateOrderedItemDto } from 'src/orders/dto/create-order.dto';
import { IsArrayOfScheduleSlots } from '../subscriptions.decorators';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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

export class SubscriptionDto {
	@IsArray()
	@ArrayNotEmpty()
	@Type(() => SubscriptionItemDto)
	@ValidateNested({ each: true })
	subscriptionItems: SubscriptionItemDto[];
}
