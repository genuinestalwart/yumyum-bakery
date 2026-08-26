import crypto from 'crypto';
import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeRoleDto } from './dto/update-employee-role.dto';
import { ROLES, type Role } from 'src/common/types/roles.types';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { Auth0Service } from 'src/auth0/auth0.service';
import {
	AUTH0_CONNECTION,
	AUTH0_ROLE_IDS,
	AUTH0_ROLE_PREFIX,
} from 'src/auth0/auth0.constants';
import { UsersService } from 'src/users/users.service';
import { serializeProtectedUser } from 'src/users/users.utils';
import { ProtectedUserResponseDto } from 'src/users/dto/protected-user-response.dto';
import { createLogger } from 'src/common/utils/logger.util';

@Injectable()
export class EmployeesService {
	constructor(
		private readonly auth0Service: Auth0Service,
		private readonly usersService: UsersService,
	) {}

	private readonly logger = createLogger(EmployeesService.name);

	/**
	 * Creates a new MANAGER or STAFF with an unverified email address.
	 *
	 * @throws {ForbiddenException} If the requester doesn't have a higher role
	 * than the employee being created.
	 */
	async create(
		dto: CreateEmployeeDto,
		requesterRole: Role,
	): Promise<ProtectedUserResponseDto> {
		this.ensureHigherRole(requesterRole, ROLES[dto.role]);

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

		try {
			await this.auth0Service.users.roles.assign(id, {
				roles: [AUTH0_ROLE_IDS[dto.role]],
			});

			this.logger.log(`Employee created successfully | ID: ${id}`);
			return serializeProtectedUser(employee);
		} catch (error) {
			await this.auth0Service.users.delete(id);
			throw error;
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

		const oldRoleId = AUTH0_ROLE_IDS[employee.role];
		const newRoleId = AUTH0_ROLE_IDS[dto.role];
		await this.auth0Service.users.roles.delete(id, { roles: [oldRoleId] });

		try {
			await this.auth0Service.users.roles.assign(id, { roles: [newRoleId] });

			try {
				await this.auth0Service.users.update(id, {
					app_metadata: { role: AUTH0_ROLE_PREFIX + dto.role },
				});
			} catch (appMetadataError) {
				await this.auth0Service.users.roles.delete(id, { roles: [newRoleId] });
				throw appMetadataError;
			}
		} catch (error) {
			await this.auth0Service.users.roles.assign(id, { roles: [oldRoleId] });
			throw error;
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
			this.logger.warn(`${requesterRole} can't modify ${targetRole}`);
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
		const employee = await this.auth0Service.users.update(id, { blocked });

		this.logger.log(
			`Employee ${blocked ? 'd' : 'r'}eactivated successfully | ID: ${id}`,
		);

		return serializeProtectedUser(employee);
	}
}
