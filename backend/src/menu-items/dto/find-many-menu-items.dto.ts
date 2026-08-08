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
	QueryToCategory,
	StringToBoolean,
	TrimOnly,
} from 'src/common/decorators/transform.decorators';

export class FindManyMenuItemsDto {
	@QueryToCategory()
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	@MaxLength(20, { each: true })
	@Matches(REGEX_KEBAB_CASE, { each: true })
	categories?: string[];

	@StringToBoolean()
	@IsOptional()
	@IsBoolean()
	isInStock?: boolean;

	@StringToBoolean()
	@IsOptional()
	@IsBoolean()
	isPreOrderOnly?: boolean;

	@TrimOnly()
	@IsOptional()
	@IsString()
	search?: string;
}
