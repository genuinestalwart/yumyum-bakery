import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Auth0Service } from 'src/auth0/auth0.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { generatePassword } from 'src/common/utils/generate-password.util';
import { FindManyUsersDto } from './dto/find-many-users.dto';
import { SORT_BY } from './users.types';
import { AUTH0_CONNECTION, AUTH0_ROLE_PREFIX } from 'src/auth0/auth0.constants';
import Auth0 from 'src/auth0/auth0.types';
import { RequestedBy, Role, ROLES } from 'src/common/types/roles.types';
import { normalizeRoles } from 'src/common/utils/normalize-roles.util';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { FullUserResponseDto } from './dto/full-user-response.dto';
import { PartialUserResponseDto } from './dto/partial-user-response.dto';
import { OrderStatus } from 'prisma/generated/enums';
import { Prisma } from 'prisma/generated/client';
import { UpdateUserEmailDto } from './dto/update-user-email.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { ManagementError } from 'auth0';

@Injectable()
export class UsersService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly prismaService: PrismaService,
	) {}

	private fields =
		'app_metadata,blocked,created_at,email,email_verified,identities,name,picture,updated_at,user_id';

	private finalOrderStatuses: OrderStatus[] = [
		'CANCELLED',
		'COMPLETED',
		'DELIVERED',
		'FAILED',
		'PICKED_UP',
		'REJECTED',
	];

	private readonly logger = new Logger(UsersService.name, {
		timestamp: true,
	});

	async createUser(
		currentUser: RequestedBy,
		dto: CreateUserDto,
	): Promise<CreateUserResponseDto> {
		if (currentUser.role === ROLES[dto.role]) {
			// If MANAGER tries to create a new MANAGER
			throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
		}

		/*
		1-a. Create a new user
		1-b. Throw error if user creation fails
		2-a. Assign the role mentioned in the dto
		2-b. Throw error if role assignment fails and delete the newly created user
		*/
		try {
			const newUser = await this.auth0Service.users.create({
				app_metadata: { role: AUTH0_ROLE_PREFIX + dto.role },
				connection: AUTH0_CONNECTION,
				email: dto.email,
				email_verified: false,
				name: dto.name,
				password: generatePassword(),
				verify_email: false,
			});

			const id = newUser.user_id as string;
			const roles = [process.env[`AUTH0_ROLE_${dto.role}`] as string];

			try {
				await this.auth0Service.users.roles.assign(id, { roles });
				return { ...this.normalizeUser(newUser), role: dto.role };
			} catch (roleAssignError) {
				this.logger.error(
					`Role assignment failed for user ${id}. Initiating cleanup delete.`,
					roleAssignError,
				);

				try {
					await this.auth0Service.users.delete(id);
				} catch (deleteUserError) {
					this.logger.error(
						`Cleanup delete action failed for user ${id}`,
						deleteUserError,
					);
				}

				throw roleAssignError;
			}
		} catch (error) {
			this.logger.error(`User create action failed`, error);

			if (
				error instanceof ManagementError &&
				error.statusCode === HttpStatus.CONFLICT
			) {
				// If another existing user has the same email provided in the request
				throw new ConflictException(ERROR_MESSAGES.CONFLICT_DUPLICATE);
			}

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findManyUsers(dto: FindManyUsersDto): Promise<FullUserResponseDto[]> {
		// Build the query based on the existence of the values
		let query = `identities.connection:"${AUTH0_CONNECTION}"`;

		if (dto.blocked !== undefined) {
			query += ` AND blocked:${dto.blocked}`;
		}

		if (dto.role) {
			query += ` AND app_metadata.role:"${AUTH0_ROLE_PREFIX + dto.role}"`;
		}

		if (dto.search) {
			const sanitizedSearch = this.sanitizeSearch(dto.search);
			query += ` AND (name:*${sanitizedSearch}* OR email:*${sanitizedSearch}*)`;
		}

		try {
			const { data: users } = await this.auth0Service.users.list({
				fields: this.fields,
				include_fields: true,
				page: dto.page ? dto.page - 1 : 0,
				per_page: dto.limit ?? 20,
				primary_order: true,
				q: query,
				search_engine: 'v3',
				sort: `${dto.sortBy ?? SORT_BY.NAME}:${dto.sortOrder === 'desc' ? -1 : 1}`,
			});

			return users.map((user) => {
				const rawRole = (user.app_metadata?.role || '') as string;
				const role = normalizeRoles([rawRole])[0] as Role;
				return { ...this.normalizeUser(user), role };
			});
		} catch (error) {
			this.logger.error(`User search action failed`, error);

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findFullUser(id: string): Promise<FullUserResponseDto> {
		const params = { fields: this.fields, include_fields: true };
		const rawUser = await this.auth0Service.users.get(id, params);
		const rawRole = (rawUser.app_metadata?.role || '') as string;
		const role = normalizeRoles([rawRole])[0] as Role;
		return { ...this.normalizeUser(rawUser), role };
	}

	async findPartialUser(id: string): Promise<PartialUserResponseDto> {
		const fields = 'app_metadata,name,picture,user_id';
		const params = { fields, include_fields: true };
		const rawUser = await this.auth0Service.users.get(id, params);
		const rawRole = (rawUser.app_metadata?.role || '') as string;

		return {
			id: rawUser.user_id as string,
			name: rawUser.name as string,
			picture: rawUser.picture as string,
			role: normalizeRoles([rawRole])[0] as Role,
		};
	}

	async updateUserRole(
		dto: UpdateUserRoleDto,
		id: string,
	): Promise<FullUserResponseDto> {
		const user = await this.findFullUser(id);

		if (!([ROLES.MANAGER, ROLES.STAFF] as Role[]).includes(user.role)) {
			// Only the role of a MANAGER or STAFF can be changed
			throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
		}

		if (dto.role === user.role) {
			// If the user already has the assignable role
			return user;
		}

		const roleIdMapper: Record<'manager' | 'staff', string> = {
			[ROLES.MANAGER]: process.env['AUTH0_ROLE_MANAGER'] as string,
			[ROLES.STAFF]: process.env['AUTH0_ROLE_STAFF'] as string,
		};

		/*
		1. Remove the old role
		2-a. Assign the new role
		2-b. Throw error if new role assignment fails and reassign the old role
		3-a. Update 'app_metadata' with the new role
		3-b. Throw error if updating 'app_metadata' fails, remove the new role, and reassign the old role
		*/
		const oldRoleId = roleIdMapper[user.role];
		const newRoleId = roleIdMapper[dto.role];
		await this.auth0Service.users.roles.delete(id, { roles: [oldRoleId] });

		try {
			await this.auth0Service.users.roles.assign(id, { roles: [newRoleId] });

			try {
				await this.auth0Service.users.update(id, {
					app_metadata: { role: AUTH0_ROLE_PREFIX + dto.role },
				});
			} catch (appMetadataError) {
				this.logger.error(
					`Failed to update app_metadata of user ${id}. Undoing role assignment.`,
					appMetadataError,
				);

				try {
					await this.auth0Service.users.roles.delete(id, {
						roles: [newRoleId],
					});
				} catch (undoRoleAssignError) {
					this.logger.error(
						`Failed to undo role assignment of user ${id}`,
						undoRoleAssignError,
					);
				}

				throw appMetadataError;
			}
		} catch (error) {
			this.logger.error(
				`Failed to assign new role to user ${id}. Undoing role removal`,
				error,
			);

			try {
				await this.auth0Service.users.roles.assign(id, { roles: [oldRoleId] });
			} catch (undoRoleRemoveError) {
				this.logger.error(
					`Failed to undo role removal of user${id}`,
					undoRoleRemoveError,
				);
			}

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}

		return await this.findFullUser(id);
	}

	async updateUserEmail(
		dto: UpdateUserEmailDto,
		id: string,
	): Promise<FullUserResponseDto> {
		const user = await this.findFullUser(id);

		if (dto.email === user.email) {
			// If the provided email is same as the current email
			return user;
		}

		try {
			// Trigger email verification system of auth0 while updating the email field
			const customer = await this.auth0Service.users.update(id, {
				email: dto.email,
				email_verified: false,
				verify_email: true,
			});

			return { ...this.normalizeUser(customer), role: ROLES.CUSTOMER };
		} catch (error) {
			this.logger.error(`Failed to update user ${id}`, error);

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async updateUserProfile(
		dto: UpdateUserProfileDto,
		currentUser: RequestedBy,
	): Promise<FullUserResponseDto> {
		if (!Object.keys(dto).length) {
			// If the request body is fully empty
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		const user = await this.auth0Service.users.update(currentUser.id, dto);
		return { ...this.normalizeUser(user), role: currentUser.role };
	}

	async deactivateUser(
		currentUser: RequestedBy,
		id: string,
	): Promise<FullUserResponseDto> {
		return this.setUserBlockStatus(true, currentUser, id);
	}

	async reactivateUser(
		currentUser: RequestedBy,
		id: string,
	): Promise<FullUserResponseDto> {
		return this.setUserBlockStatus(false, currentUser, id);
	}

	async banCustomer(id: string): Promise<FullUserResponseDto> {
		return this.setCustomerBanStatus(true, id);
	}

	async unbanCustomer(id: string): Promise<FullUserResponseDto> {
		return this.setCustomerBanStatus(false, id);
	}

	async deleteCustomer(id: string): Promise<void> {
		const activeOrders = await this.prismaService.order.count({
			where: {
				customerId: id,
				orderStatus: { notIn: this.finalOrderStatuses },
			},
		});

		if (activeOrders) {
			// If the CUSTOMER has any orders ongoing or unfinished
			throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
		}

		await this.prismaService.$transaction(async (tx) => {
			await this.purgeCustomerData(tx, id);

			await tx.order.updateMany({
				data: { customerId: null },
				where: { customerId: id },
			});

			await this.auth0Service.users.delete(id);
		});
	}

	private sanitizeSearch(query: string) {
		const regex = /([\+\-\!\(\)\{\}\[\]\^\'\"\~\*\?\:\\\/]|\&\&|\|\|)/g;
		return query.replace(regex, '\\$1');
	}

	private normalizeUser(user: Auth0.UserResponseSchema) {
		return {
			blocked: user.blocked as boolean,
			createdAt: user.created_at as string,
			email: user.email as string,
			emailVerified: user.email_verified as boolean,
			id: user.user_id as string,
			identities: user.identities as Auth0.UserIdentity[],
			name: user.name as string,
			picture: user.picture as string,
			updatedAt: user.updated_at as string,
		};
	}

	private async purgeCustomerData(tx: Prisma.TransactionClient, id: string) {
		await tx.cartItem.deleteMany({ where: { customerId: id } });
		await tx.review.deleteMany({ where: { customerId: id } });
		await tx.subscription.deleteMany({ where: { customerId: id } });
	}

	private async updateBlockStatus(blocked: boolean, id: string) {
		const update: Auth0.UpdateUserRequestContent = { blocked };
		return await this.auth0Service.users.update(id, update);
	}

	private async setUserBlockStatus(
		blocked: boolean,
		currentUser: RequestedBy,
		id: string,
	) {
		const user = await this.findPartialUser(id);

		if (!([ROLES.MANAGER, ROLES.STAFF] as Role[]).includes(user.role)) {
			// Only a MANAGER or STAFF's account can be deactivated/reactivated
			throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
		}

		if (currentUser.role === user.role) {
			// User can't deactivate/reactivate another user with the same role
			throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
		}

		try {
			const updatedUser = await this.updateBlockStatus(blocked, id);
			return { ...this.normalizeUser(updatedUser), role: user.role };
		} catch (error) {
			this.logger.error(`Failed to update user ${id}`, error);

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}
	}

	private async setCustomerBanStatus(blocked: boolean, id: string) {
		const user = await this.findPartialUser(id);

		if (user.role !== ROLES.CUSTOMER) {
			// Only a CUSTOMER can be banned/unbanned
			throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
		}

		try {
			if (blocked) {
				const customer = await this.prismaService.$transaction(async (tx) => {
					await this.purgeCustomerData(tx, id);

					await tx.order.updateMany({
						data: { orderStatus: 'CANCELLED' },
						where: {
							customerId: id,
							orderStatus: { notIn: this.finalOrderStatuses },
						},
					});

					return await this.updateBlockStatus(blocked, id);
				});

				return { ...this.normalizeUser(customer), role: user.role };
			} else {
				const customer = await this.updateBlockStatus(blocked, id);
				return { ...this.normalizeUser(customer), role: user.role };
			}
		} catch (error) {
			this.logger.error(`Failed to update user ${id}`, error);

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
