import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AuthRole } from '../types/auth-role.type';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(
		ctx: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<AuthRole[]>(
			'roles',
			[ctx.getHandler(), ctx.getClass()],
		);

		const request: Request = ctx.switchToHttp().getRequest();
		const payload = request.auth?.payload;

		const role = payload?.[`${process.env.AUTH0_IDENTIFIER}/roles`]?.[0] as
			| AuthRole
			| undefined;

		if (!role) {
			throw new UnauthorizedException();
		}

		if (!requiredRoles.includes(role)) {
			throw new ForbiddenException();
		}

		return true;
	}
}
