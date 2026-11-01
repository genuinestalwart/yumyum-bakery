import { IsIn } from 'class-validator';
import { OrderStatus } from 'prisma/generated/enums';
const allowedStatuses = [OrderStatus.PREPARING, OrderStatus.READY] as const;
type AllowedOrderStatus = (typeof allowedStatuses)[number];

export class UpdateOrderStatusDto {
	@IsIn(allowedStatuses)
	orderStatus: AllowedOrderStatus;
}
