import {
	ArrayNotEmpty,
	IsArray,
	IsBoolean,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
} from 'class-validator';
import { REGEX_KEBAB_CASE } from 'src/common/constants/regex.constants';
import {
	QueryToCategoryNames,
	QueryToBoolean,
	ToTrimmed,
} from 'src/common/decorators/transform.decorators';

export class FindManyMenuItemsDto {
	@QueryToCategoryNames()
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	@MaxLength(20, { each: true })
	@Matches(REGEX_KEBAB_CASE, { each: true })
	categories?: string[];

	@QueryToBoolean()
	@IsOptional()
	@IsBoolean()
	isInStock?: boolean;

	@QueryToBoolean()
	@IsOptional()
	@IsBoolean()
	isPreOrderOnly?: boolean;

	@ToTrimmed()
	@IsOptional()
	@IsString()
	search?: string;
}
