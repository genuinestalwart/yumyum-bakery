import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { REGEX_KEBAB_CASE } from 'src/common/constants/regex.constants';

export class MenuCategoryResponseDto {
	@ApiResponseProperty({ format: 'uuid' })
	id: string;

	@ApiProperty({
		example: 'kebab-case',
		pattern: REGEX_KEBAB_CASE,
		type: 'string',
	})
	name: string;
}
