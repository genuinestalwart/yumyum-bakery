import crypto from 'crypto';
import {
	ConflictException,
	ForbiddenException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeRoleDto } from './dto/update-employee-role.dto';
import { ROLES, type Role } from 'src/common/types/roles.types';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { Auth0Service } from 'src/auth0/auth0.service';
import { AUTH0_CONNECTION, AUTH0_ROLE_PREFIX } from 'src/auth0/auth0.constants';
import { ManagementError } from 'auth0';
import { UsersService } from 'src/users/users.service';
import { serializeProtectedUser } from 'src/users/users.utils';
import { ProtectedUserResponseDto } from 'src/users/dto/protected-user-response.dto';

@Injectable()
export class EmployeesService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly usersService: UsersService,
	) {}

	private readonly logger = new Logger(EmployeesService.name, {
		timestamp: true,
	});

	/**
	 * Creates a new MANAGER or STAFF with an unverified email address.
	 *
	 * @throws {ForbiddenException} If the requester doesn't have a higher role
	 * than the employee being created.
	 * @throws {ConflictException} If the email address is already in use.
	 */
	async create(
		dto: CreateEmployeeDto,
		requesterRole: Role,
	): Promise<ProtectedUserResponseDto> {
		this.ensureHigherRole(requesterRole, ROLES[dto.role]);

		try {
			const employee = await this.auth0Service.users.create({
				app_metadata: { role: AUTH0_ROLE_PREFIX + dto.role },
				connection: AUTH0_CONNECTION,
				email: dto.email,
				email_verified: false,
				name: dto.name,
				password: this.generatePassword(),
				verify_email: false,
			});

			const id = employee.user_id as string;
			const roles = [process.env[`AUTH0_ROLE_${dto.role}`] as string];

			try {
				await this.auth0Service.users.roles.assign(id, { roles });
				return serializeProtectedUser(employee);
			} catch (roleAssignError) {
				this.logger.error(
					`Role assignment failed for employee ${id}. Initiating cleanup delete.`,
					roleAssignError,
				);

				try {
					await this.auth0Service.users.delete(id);
				} catch (deleteEmployeeError) {
					this.logger.error(
						`Cleanup delete action failed for employee ${id}`,
						deleteEmployeeError,
					);
				}

				throw roleAssignError;
			}
		} catch (error) {
			this.logger.error(`Employee create action failed`, error);

			if (
				error instanceof ManagementError &&
				error.statusCode === HttpStatus.CONFLICT
			) {
				throw new ConflictException(ERROR_MESSAGES.CONFLICT_DUPLICATE);
			}

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}
	}

	/**
	 * Updates the role of an existing MANAGER or STAFF.
	 *
	 * @throws {NotFoundException} If the employee's role is not MANAGER or STAFF.
	 * @throws {ConflictException} If the employee is deactivated.
	 */
	async updateRole(
		dto: UpdateEmployeeRoleDto,
		id: string,
	): Promise<ProtectedUserResponseDto> {
		const employee = await this.usersService.findProtectedOne(id);

		if (!(employee.role === ROLES.MANAGER || employee.role === ROLES.STAFF)) {
			throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
		}

		this.usersService.ensureNotBlocked(employee.blocked, employee.role);

		if (employee.role === dto.role) {
			return employee;
		}

		const roleIdMapper: Record<'manager' | 'staff', string> = {
			[ROLES.MANAGER]: process.env['AUTH0_ROLE_MANAGER'] as string,
			[ROLES.STAFF]: process.env['AUTH0_ROLE_STAFF'] as string,
		};

		const oldRoleId = roleIdMapper[employee.role];
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
					`Failed to update app_metadata of employee ${id}. Undoing role assignment.`,
					appMetadataError,
				);

				try {
					await this.auth0Service.users.roles.delete(id, {
						roles: [newRoleId],
					});
				} catch (undoRoleAssignError) {
					this.logger.error(
						`Failed to undo role assignment of employee ${id}`,
						undoRoleAssignError,
					);
				}

				throw appMetadataError;
			}
		} catch (error) {
			this.logger.error(
				`Failed to assign new role to employee ${id}. Undoing role removal`,
				error,
			);

			try {
				await this.auth0Service.users.roles.assign(id, { roles: [oldRoleId] });
			} catch (undoRoleRemoveError) {
				this.logger.error(
					`Failed to undo role removal of employee ${id}`,
					undoRoleRemoveError,
				);
			}

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}

		return await this.usersService.findProtectedOne(id);
	}

	async deactivate(
		id: string,
		requesterRole: Role,
	): Promise<ProtectedUserResponseDto> {
		return this.setBlockStatus(true, id, requesterRole);
	}

	async reactivate(
		id: string,
		requesterRole: Role,
	): Promise<ProtectedUserResponseDto> {
		return this.setBlockStatus(false, id, requesterRole);
	}

	private ensureHigherRole(requesterRole: Role, targetRole: Role): void {
		const hierarchy = [
			ROLES.CUSTOMER,
			ROLES.STAFF,
			ROLES.MANAGER,
			ROLES.ADMIN,
		] as const;

		if (hierarchy.indexOf(requesterRole) <= hierarchy.indexOf(targetRole)) {
			throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
		}
	}

	private generatePassword(length = 12): string {
		const password = crypto
			.randomBytes(length)
			.toString('base64')
			.replace(/[^a-zA-Z0-9]/g, '')
			.slice(0, length);

		return `${password}!1Aa`;
	}

	/**
	 * Deactivates or reactivates a MANAGER or STAFF by updating their 'blocked' status.
	 *
	 * @throws {NotFoundException} If the user is not a MANAGER or STAFF.
	 * @throws {ForbiddenException} If the requester does not have a higher role
	 * than the employee being created.
	 */
	private async setBlockStatus(
		blocked: boolean,
		id: string,
		requesterRole: Role,
	): Promise<ProtectedUserResponseDto> {
		const { role: targetRole } = await this.usersService.findPublicOne(id);

		if (!(targetRole === ROLES.MANAGER || targetRole === ROLES.STAFF)) {
			throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
		}

		this.ensureHigherRole(requesterRole, targetRole);

		try {
			const employee = await this.auth0Service.users.update(id, { blocked });
			return serializeProtectedUser(employee);
		} catch (error) {
			this.logger.error(`Failed to update employee ${id}`, error);

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
