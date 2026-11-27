import {
	ConflictException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Auth0Service } from 'src/auth0/auth0.service';
import { FindProtectedManyUsersDto } from './dto/find-protected-many-users.dto';
import { SORT_BY } from './users.types';
import { AUTH0_CONNECTION, AUTH0_ROLE_PREFIX } from 'src/auth0/auth0.constants';
import {
	ROLES,
	type RequestedBy,
	type Role,
} from 'src/common/types/roles.types';
import { ProtectedUserResponseDto } from './dto/protected-user-response.dto';
import { PublicUserResponseDto } from './dto/public-user-response.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';
import { serializeProtectedUser, serializePublicUser } from './users.utils';
import { createLogger } from 'src/common/utils/logger.util';
import { FindPublicManyUsersDto } from './dto/find-public-many-users.dto';
import { getSortOrder } from 'src/common/utils/sort-order.util';

@Injectable()
export class UsersService {
	constructor(private readonly auth0Service: Auth0Service) {}
	private readonly logger = createLogger(UsersService.name);

	private publicFields = 'app_metadata,name,picture,user_id';
	private protectedFields = `blocked,created_at,email,email_verified,identities,updated_at,${this.publicFields}`;

	async findProtectedMany(
		dto: FindProtectedManyUsersDto,
	): Promise<ProtectedUserResponseDto[]> {
		let query = `identities.connection:"${AUTH0_CONNECTION}"`;
		const sortBy = dto.sortBy ? SORT_BY[dto.sortBy] : SORT_BY.NAME;

		if (dto.isBlocked !== undefined) {
			query += ` AND blocked:${dto.isBlocked}`;
		}

		if (dto.role) {
			query += ` AND app_metadata.role:"${AUTH0_ROLE_PREFIX + dto.role}"`;
		}

		if (dto.search) {
			const regex = /([\+\-\!\(\)\{\}\[\]\^\'\"\~\*\?\:\\\/]|\&\&|\|\|)/g;
			const sanitizedSearch = dto.search.replace(regex, '\\$1');
			query += ` AND (name:*${sanitizedSearch}* OR email:*${sanitizedSearch}*)`;
		}

		const { data: users } = await this.auth0Service.users.list({
			fields: this.protectedFields,
			include_fields: true,
			page: dto.page ? dto.page - 1 : 0,
			per_page: dto.limit ?? 20,
			primary_order: true,
			q: query,
			search_engine: 'v3',
			sort: `${sortBy}:${getSortOrder(dto.sortOrder) === 'desc' ? -1 : 1}`,
		});

		return users.map((user) => serializeProtectedUser(user));
	}

	async findPublicMany(
		dto: FindPublicManyUsersDto,
	): Promise<PublicUserResponseDto[]> {
		const { data: users } = await this.auth0Service.users.list({
			fields: this.publicFields,
			include_fields: true,
			page: dto.page ? dto.page - 1 : 0,
			per_page: dto.limit ?? 20,
			primary_order: true,
			q: `identities.connection:"${AUTH0_CONNECTION}" And (${dto.userIds.map((id) => `user_id:"${id}"`).join(' OR ')})`,
			search_engine: 'v3',
			sort: 'name:1',
		});

		return users.map((user) => serializePublicUser(user));
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

	async updateProfile(
		dto: UpdateUserProfileDto,
		requester: RequestedBy,
	): Promise<ProtectedUserResponseDto> {
		const { blocked, role } = await this.findProtectedOne(requester.id);
		this.ensureNotBlocked(blocked, role);
		const user = await this.auth0Service.users.update(requester.id, dto);
		return serializeProtectedUser(user);
	}

	ensureNotBlocked(isBlocked: boolean, role: Role): void {
		if (isBlocked) {
			if (role === ROLES.MANAGER || role === ROLES.STAFF) {
				this.logger.warn(`Employee is currently deactivated`);
				throw new ConflictException(ERROR_MESSAGES.CONFLICT_STATE);
			}

			if (role === ROLES.CUSTOMER) {
				this.logger.warn(`CUSTOMER is currently banned`);
				throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
			}
		}
	}
}
