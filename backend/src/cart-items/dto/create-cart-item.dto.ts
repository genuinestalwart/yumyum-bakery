import { IsUUID } from 'class-validator';

export class CreateCartItemDto {
	@IsUUID()
	menuItemId: string;
}
