import {
	BadRequestException,
	ConflictException,
	Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, OrderType, PaymentStatus } from 'prisma/generated/enums';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { OrderResponseUnion } from '../orders.types';
import {
	validateOrderStatus,
	firstAndLastStatuses,
	generateVerificationCode,
	include,
	serializeOrder,
} from '../orders.utils';
import { createLogger } from 'src/common/utils/logger.util';

@Injectable()
export class StatusesService {
	constructor(private readonly prismaService: PrismaService) {}
	private readonly logger = createLogger(StatusesService.name);

	async updateStatus(
		id: string,
		next: OrderStatus,
	): Promise<OrderResponseUnion> {
		await this.ensureValidStatus(id, next);
		const isReady = next === OrderStatus.READY;
		const code = isReady ? generateVerificationCode() : undefined;
		return this.updateAndSerialize(undefined, id, next, code);
	}

	async cancel(
		customerId: string | undefined,
		id: string,
	): Promise<OrderResponseUnion> {
		const next = OrderStatus.CANCELLED;
		await this.ensureValidStatus(id, next);
		return this.updateAndSerialize(customerId, id, next, undefined);
	}

	async finish(id: string, code?: string) {
		const order = await this.ensureValidStatus(id, 'FINISHED');
		const needsVerification = order.orderType !== OrderType.WALK_IN;

		if (needsVerification && (!code || code !== order.verificationCode)) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		return this.updateAndSerialize(undefined, id, order.next, null);
	}

	private async ensureValidStatus(
		id: string,
		status: OrderStatus | 'FINISHED',
	) {
		const order = await this.prismaService.order.findUniqueOrThrow({
			select: {
				orderStatus: true,
				orderType: true,
				paymentStatus: true,
				verificationCode: true,
			},
			where: { id },
		});

		const { orderStatus, orderType, verificationCode } = order;
		const isFinished = status === 'FINISHED';
		const isPaid = order.paymentStatus === PaymentStatus.PAID;
		const next = isFinished ? firstAndLastStatuses[orderType][1] : status;
		const isValidStatus = validateOrderStatus(next, orderStatus, orderType);

		if (!isValidStatus || (isFinished && !isPaid)) {
			this.logger.warn(`Invalid order status or not paid yet | ID: ${id}`);
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		return { next, orderType, verificationCode };
	}

	private async updateAndSerialize(
		customerId: string | undefined,
		id: string,
		orderStatus: OrderStatus,
		verificationCode: string | null | undefined,
	): Promise<OrderResponseUnion> {
		const order = await this.prismaService.order.update({
			data: { orderStatus, verificationCode },
			include,
			where: { customerId, id },
		});

		return serializeOrder(false, order);
	}
}
