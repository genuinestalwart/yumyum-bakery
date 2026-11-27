import {
	ArrayNotEmpty,
	IsArray,
	IsBoolean,
	IsEnum,
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator';
import { ScheduleSlot } from 'prisma/generated/enums';
import {
	QueryToArray,
	QueryToBoolean,
	ToTrimmed,
	ToTrimmedLowerCase,
} from 'src/common/decorators/transform.decorators';
import { ON_DAYS, OnDays } from '../subscriptions.types';
import { SORT_ORDER, type SortOrder } from 'src/common/types/sorting.types';

export class FindProtectedManySubscriptionsDto {
	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	customerId?: string;

	@QueryToArray()
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsIn(Object.keys(ON_DAYS), { each: true })
	days?: OnDays[];

	@QueryToBoolean()
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@QueryToBoolean()
	@IsOptional()
	@IsBoolean()
	isApproved?: boolean;

	@QueryToArray()
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, { each: true })
	menuItems?: string[];

	@QueryToArray()
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsEnum(ScheduleSlot, { each: true })
	slots?: ScheduleSlot[];

	@ToTrimmedLowerCase()
	@IsOptional()
	@IsIn(Object.keys(SORT_ORDER))
	sortOrder?: SortOrder;
}
