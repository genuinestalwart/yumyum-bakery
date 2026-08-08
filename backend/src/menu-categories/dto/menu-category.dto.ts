import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { TrimToCategory } from 'src/common/decorators/transform.decorators';
import { REGEX_KEBAB_CASE } from 'src/common/constants/regex.constants';

export class MenuCategoryDto {
	@ApiProperty({ example: 'kebab-case' })
	@TrimToCategory()
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	@Matches(REGEX_KEBAB_CASE)
	name: string;
}
