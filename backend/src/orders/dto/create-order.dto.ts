import { Type } from 'class-transformer';
import {
	ArrayNotEmpty,
	IsArray,
	IsEnum,
	IsInt,
	IsOptional,
	IsUUID,
	Max,
	Min,
	ValidateNested,
} from 'class-validator';
import { OrderType } from 'prisma/generated/enums';
import { ToTrimmedUpperCase } from 'src/common/decorators/transform.decorators';
import { LocationDto } from 'src/common/dto/location.dto';

export class CreateOrderedItemDto {
	@IsUUID()
	menuItemId: string;

	@IsInt()
	@Max(999)
	@Min(1)
	quantity: number;
}

export class CreateOrderDto {
	location?: LocationDto;

	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@Type(() => CreateOrderedItemDto)
	@ValidateNested({ each: true })
	orderedItems?: CreateOrderedItemDto[];

	@ToTrimmedUpperCase()
	@IsEnum(OrderType)
	orderType: OrderType;

	@IsOptional()
	@IsUUID()
	subscriptionId?: string;
}
