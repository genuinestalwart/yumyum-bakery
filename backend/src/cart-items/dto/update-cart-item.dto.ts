import { IsInt, Max, Min } from 'class-validator';

export class UpdateCartItemDto {
	@IsInt()
	@Max(999)
	@Min(0)
	quantity: number;
}
