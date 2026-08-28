import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { UpdateCustomerEmailDto } from './dto/update-customer-email.dto';
import { Auth0Service } from 'src/auth0/auth0.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { ROLES } from 'src/common/types/roles.types';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { Prisma } from 'prisma/generated/client';
import { serializeProtectedUser } from 'src/users/users.utils';
import { ProtectedUserResponseDto } from 'src/users/dto/protected-user-response.dto';
import { createLogger } from 'src/common/utils/logger.util';

@Injectable()
export class CustomersService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

	private readonly logger = createLogger(CustomersService.name);

	/**
	 * @throws {ForbiddenException} If the CUSTOMER is banned.
	 */
	async updateEmail(
		dto: UpdateCustomerEmailDto,
		id: string,
	): Promise<ProtectedUserResponseDto> {
		const customer = await this.usersService.findProtectedOne(id);
		this.usersService.ensureNotBlocked(customer.blocked, customer.role);

		if (dto.email === customer.email) {
			return customer;
		}

		const updatedCustomer = await this.auth0Service.users.update(id, {
			email: dto.email,
			email_verified: false,
			verify_email: true,
		});

		return serializeProtectedUser(updatedCustomer);
	}

	async ban(id: string): Promise<ProtectedUserResponseDto> {
		return this.setBanStatus(true, id);
	}

	async unban(id: string): Promise<ProtectedUserResponseDto> {
		return this.setBanStatus(false, id);
	}

	/**
	 * Deletes the CUSTOMER and the relevant data.
	 *
	 * @throws {ForbiddenException} If the CUSTOMER is banned.
	 * @throws {ConflictException} If the CUSTOMER has any ongoing orders.
	 */
	async delete(id: string): Promise<void> {
		const { blocked } = await this.usersService.findProtectedOne(id);
		this.usersService.ensureNotBlocked(blocked, ROLES.CUSTOMER);

		const ongoingOrders = await this.prismaService.order.count({
			where: this.getOngoingOrdersWhere(id),
		});

		if (ongoingOrders > 0) {
			this.logger.warn(`CUSTOMER has active orders ongoing | ID: ${id}`);
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		await this.prismaService.$transaction(async (tx) => {
			await this.purgeAccountData(id, tx);

			await tx.order.updateMany({
				data: { customerId: null },
				where: { customerId: id },
			});

			await this.auth0Service.users.delete(id);
		});

		this.logger.log(`CUSTOMER deleted successfully | ID: ${id}`);
	}

	private getOngoingOrdersWhere(customerId: string): Prisma.OrderWhereInput {
		const orderStatus: Prisma.EnumOrderStatusFilter = {
			notIn: [
				'CANCELLED',
				'COMPLETED',
				'DELIVERED',
				'FAILED',
				'PICKED_UP',
				'REJECTED',
			],
		};

		return { customerId, orderStatus };
	}

	private async purgeAccountData(
		id: string,
		tx: Prisma.TransactionClient,
	): Promise<void> {
		await tx.cartItem.deleteMany({ where: { customerId: id } });
		await tx.review.deleteMany({ where: { customerId: id } });
		await tx.subscription.deleteMany({ where: { customerId: id } });
	}

	/**
	 * Bans or unbans a CUSTOMER by updating their 'blocked' status.
	 *
	 * @throws {NotFoundException} If the user is not a CUSTOMER.
	 */
	private async setBanStatus(
		blocked: boolean,
		id: string,
	): Promise<ProtectedUserResponseDto> {
		const user = await this.usersService.findProtectedOne(id);

		if (user.role !== ROLES.CUSTOMER) {
			throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
		}

		if (user.blocked === blocked) {
			return user;
		}

		if (blocked) {
			const customer = await this.prismaService.$transaction(async (tx) => {
				await this.purgeAccountData(id, tx);

				await tx.order.updateMany({
					data: { orderStatus: 'CANCELLED' },
					where: this.getOngoingOrdersWhere(id),
				});

				return await this.auth0Service.users.update(id, { blocked });
			});

			this.logger.log(`CUSTOMER banned successfully | ID: ${id}`);
			return serializeProtectedUser(customer);
		} else {
			const customer = await this.auth0Service.users.update(id, { blocked });
			this.logger.log(`CUSTOMER unbanned successfully | ID: ${id}`);
			return serializeProtectedUser(customer);
		}
	}
}
