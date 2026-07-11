import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class MenuCategoryDto {
	@IsNotEmpty()
	@IsString()
	@MaxLength(20)
	@Transform(({ value }) => {
		if (typeof value === 'string') {
			return value
				.trim()
				.toLowerCase()
				.replace(/[^a-z0-9 ]/g, '') // Remove all non-alphanumeric characters except spaces
				.replace(/\s+/g, '-'); // Replace spaces with hyphens
		}

		return value;
	})
	name: string;
}
