import {
	ArrayNotEmpty,
	IsArray,
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsString,
	IsUrl,
	IsUUID,
	Max,
	MaxLength,
	Min,
} from 'class-validator';
import { TrimOnly } from 'src/common/decorators/transform.decorators';

export class CreateMenuItemDto {
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID(4, { each: true })
	categories: string[];

	@TrimOnly()
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	description: string;

	@TrimOnly()
	@IsString()
	@IsUrl()
	@MaxLength(2048)
	image: string;

	@IsBoolean()
	isPreOrderOnly: boolean;

	@TrimOnly()
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	name: string;

	@IsInt()
	@Max(1440)
	@Min(5)
	prepTime: number;

	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0.01)
	price: number;
}
