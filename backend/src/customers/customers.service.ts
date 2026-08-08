import {
	ConflictException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	Logger,
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

@Injectable()
export class CustomersService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

	private readonly logger = new Logger(CustomersService.name, {
		timestamp: true,
	});

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

		try {
			const updatedCustomer = await this.auth0Service.users.update(id, {
				email: dto.email,
				email_verified: false,
				verify_email: true,
			});

			return serializeProtectedUser(updatedCustomer);
		} catch (error) {
			this.logger.error(`Failed to update CUSTOMER ${id}`, error);

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}
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
	 * @throws {ConflictException} If the CUSTOMER has any active orders.
	 */
	async delete(id: string): Promise<void> {
		const { blocked } = await this.usersService.findProtectedOne(id);
		this.usersService.ensureNotBlocked(blocked, ROLES.CUSTOMER);

		const activeOrders = await this.prismaService.order.count({
			where: this.getOrdersWhere(id),
		});

		if (activeOrders) {
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
	}

	private getOrdersWhere(customerId: string): Prisma.OrderWhereInput {
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

		try {
			if (blocked) {
				const customer = await this.prismaService.$transaction(async (tx) => {
					await this.purgeAccountData(id, tx);

					await tx.order.updateMany({
						data: { orderStatus: 'CANCELLED' },
						where: this.getOrdersWhere(id),
					});

					return await this.auth0Service.users.update(id, { blocked });
				});

				return serializeProtectedUser(customer);
			} else {
				const customer = await this.auth0Service.users.update(id, { blocked });
				return serializeProtectedUser(customer);
			}
		} catch (error) {
			this.logger.error(`Failed to update CUSTOMER ${id}`, error);

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
