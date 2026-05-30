import {
	createParamDecorator,
	ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';
import type { AuthRole } from '../types/auth-role.type';

export const CurrentUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const payload = request.auth?.payload;
		const id = payload?.sub as string | undefined;

		const role = payload?.[`${process.env.AUTH0_IDENTIFIER}/roles`]?.[0] as
			| AuthRole
			| undefined;

		if (!id || !role) {
			throw new UnauthorizedException();
		}

		return { id, role };
	},
);
