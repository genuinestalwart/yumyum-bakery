import { Type } from 'class-transformer';
import {
	IsIn,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	Max,
	Min,
} from 'class-validator';
import { ToTrimmedLowerCase } from 'src/common/decorators/transform.decorators';
import { SORT_ORDER, type SortOrder } from 'src/common/types/sorting.types';
import { SORT_BY, type SortBy } from '../menu-items.types';
import { FindManyMenuItemsDto } from './find-many-menu-items.dto';
import {
	REGEX_MAX_PRICE,
	REGEX_MIN_PRICE,
} from 'src/common/constants/regex.constants';

export class FindPublicManyMenuItemsDto extends FindManyMenuItemsDto {
	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Max(1440)
	@Min(10)
	maxPrepTime?: number;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Matches(REGEX_MAX_PRICE)
	maxPrice?: string;

	@Type(() => Number)
	@IsOptional()
	@IsInt()
	@Max(1435)
	@Min(5)
	minPrepTime?: number;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Matches(REGEX_MIN_PRICE)
	minPrice?: string;

	@ToTrimmedLowerCase()
	@IsOptional()
	@IsIn(Object.values(SORT_BY))
	sortBy?: SortBy;

	@ToTrimmedLowerCase()
	@IsOptional()
	@IsIn(Object.values(SORT_ORDER))
	sortOrder?: SortOrder;
}
