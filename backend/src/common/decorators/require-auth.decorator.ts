import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';

export const RequireAuth = () => {
	// Tell Swagger that bearer access token is required, then validate the token
	return applyDecorators(ApiBearerAuth(), UseGuards(AuthGuard));
};
