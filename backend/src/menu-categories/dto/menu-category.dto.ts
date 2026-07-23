import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TrimToCategory } from 'src/common/decorators/transform.decorators';

export class MenuCategoryDto {
	@TrimToCategory()
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	name: string;
}
