import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import type { AuthRole } from '../types/auth-role.type';
import { RequireAuth } from './require-auth.decorator';

export const HasRoles = (...roles: AuthRole[]) => {
	return applyDecorators(
		RequireAuth(),
		SetMetadata('roles', roles),
		UseGuards(RolesGuard),
	);
};
