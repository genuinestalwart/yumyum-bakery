import { IsString } from 'class-validator';

export class MenuCategoryResponseDto {
	@IsString()
	id: string;

	@IsString()
	name: string;
}
