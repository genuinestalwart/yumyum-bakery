import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Role } from '../types/roles.types';
import { ERROR_MESSAGES } from '../constants/errors.constants';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(
		ctx: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
			'roles',
			[ctx.getHandler(), ctx.getClass()],
		);

		const request: Request = ctx.switchToHttp().getRequest();
		const user = request.user;

		if (!user || !requiredRoles.includes(user.role)) {
			throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
		}

		return true;
	}
}
