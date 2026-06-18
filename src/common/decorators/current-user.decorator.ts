import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { RequestedBy } from '../types/roles.types';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request: Request = ctx.switchToHttp().getRequest();
		return request.user as RequestedBy;
	},
);
