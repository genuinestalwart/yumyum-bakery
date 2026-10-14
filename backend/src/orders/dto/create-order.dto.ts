import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	MaxLength,
	Min,
} from 'class-validator';
import { OrderType } from 'prisma/generated/enums';
import {
	ToTrimmed,
	ToTrimmedUpperCase,
} from 'src/common/decorators/transform.decorators';

export class CreateOrderedItemDto {
	@IsUUID()
	menuItemId: string;

	@IsInt()
	@Max(999)
	@Min(1)
	quantity: number;
}

export class CreateOrderDto {
	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(250)
	deliveryStreet?: string;

	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	deliveryCity?: string;

	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	deliveryPostalCode?: string;

	@IsOptional()
	@IsNumber()
	@Max(90)
	@Min(-90)
	deliveryLatitude?: number;

	@IsOptional()
	@IsNumber()
	@Max(180)
	@Min(-180)
	deliveryLongitude?: number;

	@IsOptional()
	orderedItems?: CreateOrderedItemDto[];

	@ToTrimmedUpperCase()
	@IsEnum(OrderType)
	orderType: OrderType;

	@IsUUID()
	subscriptionId?: string;
}
