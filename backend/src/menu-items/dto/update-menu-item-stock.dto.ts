import { IsInt, Max, Min } from 'class-validator';

export class UpdateMenuItemStockDto {
	@IsInt()
	@Max(999)
	@Min(0)
	inStock: number;
}
