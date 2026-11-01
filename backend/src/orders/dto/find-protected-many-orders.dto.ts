import { Type } from 'class-transformer';
import {
	ArrayNotEmpty,
	IsArray,
	IsBoolean,
	IsDate,
	IsEnum,
	IsIn,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	Matches,
	Max,
	Min,
} from 'class-validator';
import { OrderType } from 'prisma/generated/enums';
import {
	REGEX_MAX_PRICE,
	REGEX_MIN_PRICE,
} from 'src/common/constants/regex.constants';
import {
	QueryToArray,
	QueryToBoolean,
	ToTrimmed,
	ToTrimmedLowerCase,
} from 'src/common/decorators/transform.decorators';
import { SORT_ORDER, type SortOrder } from 'src/common/types/sorting.types';
import {
	type QueryStatus,
	SORT_BY,
	QUERY_STATUSES,
	type SortBy,
} from '../orders.types';

export class FindProtectedManyOrdersDto {
	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	customerId?: string;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	fromCreatedAt?: Date;

	@QueryToBoolean()
	@IsOptional()
	@IsBoolean()
	isPaid?: boolean;

	@QueryToArray()
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, { each: true })
	menuItems?: string[];

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Max(100)
	@Min(20)
	limit?: number;

	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Matches(REGEX_MAX_PRICE)
	maxAmount?: string;

	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Matches(REGEX_MIN_PRICE)
	minAmount?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	riderId?: string;

	@ToTrimmedLowerCase()
	@IsOptional()
	@IsIn(Object.values(SORT_BY))
	sortBy?: SortBy;

	@ToTrimmedLowerCase()
	@IsOptional()
	@IsIn(Object.values(SORT_ORDER))
	sortOrder?: SortOrder;

	@QueryToArray()
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsIn(Object.values(QUERY_STATUSES), { each: true })
	statuses?: QueryStatus[];

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	toCreatedAt?: Date;

	@QueryToArray()
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsEnum(OrderType, { each: true })
	types?: OrderType[];
}
