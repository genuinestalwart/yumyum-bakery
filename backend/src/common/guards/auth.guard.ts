import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Role } from '../types/roles.types';
import { auth } from 'express-oauth2-jwt-bearer';
import {
	AUTH0_DOMAIN,
	AUTH0_IDENTIFIER,
	AUTH0_ROLE_PREFIX,
} from 'src/auth0/auth0.constants';
import { ERROR_MESSAGES } from '../constants/errors.constants';
import { createLogger } from '../utils/logger.util';

@Injectable()
export class AuthGuard implements CanActivate {
	private checkJWT = auth({
		audience: AUTH0_IDENTIFIER,
		issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
	});

	private readonly logger = createLogger(AuthGuard.name);

	/**
	 * Validates the access token and extracts the requester's id and role from it.
	 *
	 * @throws {UnauthorizedException} If the access token is invalid
	 * or doesn't contain requester's id and role.
	 */
	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const request: Request = ctx.switchToHttp().getRequest();
		const response: Response = ctx.switchToHttp().getResponse();

		try {
			await new Promise<void>((resolve, reject) => {
				this.checkJWT(request, response, (error: any) =>
					error ? reject(error) : resolve(),
				);
			});
		} catch (error) {
			this.logger.warn(
				'JWT Validation Failed',
				error instanceof Error ? error.stack : undefined,
			);

			throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
		}

		const payload = request.auth?.payload;
		const key = `${AUTH0_IDENTIFIER}/roles`;
		const rolesInToken = payload?.[key] as string[] | undefined;
		const id = payload?.sub as string | undefined;

		if (!id || !rolesInToken || !rolesInToken.length) {
			this.logger.warn(
				`Requester Missing | ${request.method} ${request.url} | IP: ${request.ip}`,
			);

			throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
		}

		const sanitizedRoles = rolesInToken
			.filter((role) => role.startsWith(AUTH0_ROLE_PREFIX))
			.map((role) => role.slice(AUTH0_ROLE_PREFIX.length));

		request.user = { id, role: sanitizedRoles[0] as Role };
		return true;
	}
}
