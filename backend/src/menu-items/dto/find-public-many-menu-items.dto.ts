import { Type } from 'class-transformer';
import {
	IsIn,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
} from 'class-validator';
import { TrimToLowerCase } from 'src/common/decorators/transform.decorators';
import { SORT_ORDER, type SortOrder } from 'src/common/types/sorting.types';
import { SORT_BY, type SortBy } from '../menu-items.types';
import { FindManyMenuItemsDto } from './find-many-menu-items.dto';

export class FindPublicManyMenuItemsDto extends FindManyMenuItemsDto {
	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Max(1440)
	@Min(10)
	maxPrepTime?: number;

	@Type(() => Number)
	@IsOptional()
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(1.0)
	maxPrice?: number;

	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Max(1435)
	@Min(5)
	minPrepTime?: number;

	@Type(() => Number)
	@IsOptional()
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0.01)
	minPrice?: number;

	@TrimToLowerCase()
	@IsOptional()
	@IsString()
	@IsIn(Object.values(SORT_BY))
	sortBy?: SortBy = SORT_BY.POPULARITY;

	@TrimToLowerCase()
	@IsOptional()
	@IsString()
	@IsIn(Object.values(SORT_ORDER))
	sortOrder?: SortOrder = SORT_ORDER.DESC;
}
