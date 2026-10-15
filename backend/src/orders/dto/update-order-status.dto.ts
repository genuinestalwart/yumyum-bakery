import { IsIn } from 'class-validator';
import { OrderStatus } from 'prisma/generated/enums';
import type { AllowedOrderStatus } from '../orders.types';

export class UpdateOrderStatusDto {
	@IsIn([OrderStatus.PREPARING, OrderStatus.READY])
	orderStatus: AllowedOrderStatus;
}
