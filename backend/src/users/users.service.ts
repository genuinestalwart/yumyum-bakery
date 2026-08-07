import {
	ConflictException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { Auth0Service } from 'src/auth0/auth0.service';
import { FindProtectedManyUsersDto } from './dto/find-protected-many-users.dto';
import { SORT_BY } from './users.types';
import { AUTH0_CONNECTION, AUTH0_ROLE_PREFIX } from 'src/auth0/auth0.constants';
import {
	type RequestedBy,
	type Role,
	ROLES,
} from 'src/common/types/roles.types';
import { ProtectedUserResponseDto } from './dto/protected-user-response.dto';
import { PublicUserResponseDto } from './dto/public-user-response.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { serializeProtectedUser, serializePublicUser } from './users.utils';

@Injectable()
export class UsersService {
	constructor(private readonly auth0Service: Auth0Service) {}

	private publicFields = 'app_metadata,name,picture,user_id';
	private protectedFields = `blocked,created_at,email,email_verified,identities,updated_at,${this.publicFields}`;
	private readonly logger = new Logger(UsersService.name, { timestamp: true });

	async findProtectedMany(
		dto: FindProtectedManyUsersDto,
	): Promise<ProtectedUserResponseDto[]> {
		let query = `identities.connection:"${AUTH0_CONNECTION}"`;

		if (dto.blocked !== undefined) {
			query += ` AND blocked:${dto.blocked}`;
		}

		if (dto.role) {
			query += ` AND app_metadata.role:"${AUTH0_ROLE_PREFIX + dto.role}"`;
		}

		if (dto.search) {
			const regex = /([\+\-\!\(\)\{\}\[\]\^\'\"\~\*\?\:\\\/]|\&\&|\|\|)/g;
			const sanitizedSearch = dto.search.replace(regex, '\\$1');
			query += ` AND (name:*${sanitizedSearch}* OR email:*${sanitizedSearch}*)`;
		}

		try {
			const { data: users } = await this.auth0Service.users.list({
				fields: this.protectedFields,
				include_fields: true,
				page: dto.page ? dto.page - 1 : 0,
				per_page: dto.limit ?? 20,
				primary_order: true,
				q: query,
				search_engine: 'v3',
				sort: `${dto.sortBy ?? SORT_BY.NAME}:${dto.sortOrder === 'desc' ? -1 : 1}`,
			});

			return users.map((user) => serializeProtectedUser(user));
		} catch (error) {
			this.logger.error(`User search action failed`, error);

			throw new InternalServerErrorException(
				ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findProtectedOne(id: string): Promise<ProtectedUserResponseDto> {
		const params = { fields: this.protectedFields, include_fields: true };
		const user = await this.auth0Service.users.get(id, params);
		return serializeProtectedUser(user);
	}

	async findPublicOne(id: string): Promise<PublicUserResponseDto> {
		const params = { fields: this.publicFields, include_fields: true };
		const user = await this.auth0Service.users.get(id, params);
		return serializePublicUser(user);
	}

	/**
	 * @throws {ConflictException} If the user is a deactivated employee.
	 * @throws {ForbiddenException} If the user is a banned CUSTOMER.
	 */
	async updateProfile(
		dto: UpdateUserProfileDto,
		requester: RequestedBy,
	): Promise<ProtectedUserResponseDto> {
		const { blocked, role } = await this.findProtectedOne(requester.id);
		this.ensureNotBlocked(blocked, role);
		const user = await this.auth0Service.users.update(requester.id, dto);
		return serializeProtectedUser(user);
	}

	ensureNotBlocked(blocked: boolean, role: Role): void {
		if (blocked) {
			if (role === ROLES.MANAGER || role === ROLES.STAFF) {
				throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
			}

			if (role === ROLES.CUSTOMER) {
				throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
			}
		}
	}
}
