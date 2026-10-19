import { IsIn } from 'class-validator';
import { OrderStatus } from 'prisma/generated/enums';
const allowed = [OrderStatus.PREPARING, OrderStatus.READY] as const;
type AllowedOrderStatus = (typeof allowed)[number];

export class UpdateOrderStatusDto {
	@IsIn([OrderStatus.PREPARING, OrderStatus.READY])
	orderStatus: AllowedOrderStatus;
}
