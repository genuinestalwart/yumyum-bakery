import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';

export const RequireAuth = () => {
	return applyDecorators(ApiBearerAuth(), UseGuards(AuthGuard));
};
