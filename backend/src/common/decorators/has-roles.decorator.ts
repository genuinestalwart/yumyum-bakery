import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import type { Role } from '../types/roles.types';
import { RequireAuth } from './require-auth.decorator';

export const HasRoles = (...roles: Role[]) => {
	return applyDecorators(
		// Tell Swagger that bearer access token is required, then validate the token
		RequireAuth(),
		// Store the roles in metadata provided to the decorator
		SetMetadata('roles', roles),
		// Confirm whether the current user's role matches the required roles or not
		UseGuards(RolesGuard),
	);
};
