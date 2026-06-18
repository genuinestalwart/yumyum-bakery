import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import type { Role } from '../types/roles.types';
import { RequireAuth } from './require-auth.decorator';

export const HasRoles = (...roles: Role[]) => {
	return applyDecorators(
		RequireAuth(),
		SetMetadata('roles', roles),
		UseGuards(RolesGuard),
	);
};
