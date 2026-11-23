import {
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	MaxLength,
	Min,
} from 'class-validator';
import { ToTrimmed } from 'src/common/decorators/transform.decorators';

export class CreateReviewDto {
	@ToTrimmed()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	comment?: string;

	@IsOptional()
	@IsUUID()
	menuItemId?: string;

	@IsOptional()
	@IsUUID()
	orderId?: string;

	@IsInt()
	@Max(5)
	@Min(1)
	rating: number;
}
