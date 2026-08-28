import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Role } from '../types/roles.types';
import { ERROR_MESSAGES } from '../constants/errors.constants';
import { RequireRoles } from '../decorators/require-roles.decorator';
import { createLogger } from '../utils/logger.util';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}
	private readonly logger = createLogger(RolesGuard.name);

	/**
	 * Ensures that the requester has one of the required roles.
	 *
	 * @see {@link RequireRoles} Decorator required on route handlers to set `roles` metadata.
	 * @throws {ForbiddenException} If the requester doesn't have any of the required roles.
	 */

	canActivate(
		ctx: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
			ctx.getHandler(),
			ctx.getClass(),
		]);

		const request: Request = ctx.switchToHttp().getRequest();
		const { method, url, ip } = request;
		const user = request.user;

		if (!user) {
			this.logger.warn(`Requester Not Found | ${method} ${url} | IP: ${ip}`);
			throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
		}

		if (!requiredRoles.includes(user.role)) {
			this.logger.warn(
				`Missing Required Roles | ${method} ${url} | IP: ${ip} | Requester: ${JSON.stringify(user)} | Roles Required: ${requiredRoles.join(', ')}`,
			);

			throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
		}

		return true;
	}
}
