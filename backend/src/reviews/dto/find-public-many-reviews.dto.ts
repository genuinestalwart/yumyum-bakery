import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ToTrimmedUpperCase } from 'src/common/decorators/transform.decorators';
import { SORT_ORDER, type SortOrder } from 'src/common/types/sorting.types';
import { Type } from 'class-transformer';

export class FindPublicManyReviewsDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Max(100)
	@Min(20)
	limit?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ToTrimmedUpperCase()
	@IsOptional()
	@IsIn(Object.keys(SORT_ORDER))
	sortOrder?: SortOrder;
}
