import {
	type CanActivate,
	type ExecutionContext,
	HttpStatus,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { normalizeRoles } from '../utils/normalize-roles.utils';
import { Role } from '../types/roles.types';
import { AUTH0_IDENTIFIER } from '../../auth0/auth0.constants';
import { ERROR_MESSAGES } from '../constants/errors.constants';

@Injectable()
export class AuthGuard implements CanActivate {
	private checkJWT = auth({
		audience: AUTH0_IDENTIFIER,
		issuerBaseURL: process.env.AUTH0_TENANT as string,
	});

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const request: Request = ctx.switchToHttp().getRequest();
		const response: Response = ctx.switchToHttp().getResponse();

		try {
			await new Promise<void>((resolve, reject) => {
				this.checkJWT(request, response, (error: any) => {
					if (error) {
						return reject(error);
					}

					resolve();
				});
			});
		} catch (error) {
			throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
		}

		const payload = request.auth?.payload;
		const key = `${AUTH0_IDENTIFIER}/roles`;
		const roles = payload?.[key] as string[] | undefined;
		const id = payload?.sub as string | undefined;

		if (!id || !roles || !roles.length) {
			throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
		}

		request.user = { id, role: normalizeRoles(roles)[0] as Role };
		return true;
	}
}
