import {
	Controller,
	Get,
	Body,
	Patch,
	Param,
	BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Requester } from 'src/common/decorators/requester.decorator';
import type { RequestedBy } from 'src/common/types/roles.types';
import {
	ApiFindProtectedUserResource,
	ApiFindPublicUserResource,
	ApiUpdateUserProfileResource,
} from './users.decorators';
import { ApiGlobalErrors } from 'src/common/decorators/swagger.decorators';
import { ProtectedUserResponseDto } from './dto/protected-user-response.dto';
import { RequireAuth } from 'src/common/decorators/require-auth.decorator';
import { PublicUserResponseDto } from './dto/public-user-response.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ERROR_MESSAGES } from 'src/common/constants/errors.constants';

@ApiGlobalErrors()
@ApiTags('Users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiFindProtectedUserResource()
	@ApiOperation({ summary: 'Find a protected user' })
	@Get('me')
	@RequireAuth()
	async findProtectedOne(
		@Requester() requester: RequestedBy,
	): Promise<ProtectedUserResponseDto> {
		return this.usersService.findProtectedOne(requester.id);
	}

	@ApiFindPublicUserResource()
	@ApiOperation({ summary: 'Find a public user' })
	@Get(':id')
	async findPublicOne(@Param('id') id: string): Promise<PublicUserResponseDto> {
		return this.usersService.findPublicOne(id);
	}

	@ApiOperation({ summary: "Update a user's profile" })
	@ApiUpdateUserProfileResource()
	@Patch('me/profile')
	@RequireAuth()
	async updateProfile(
		@Body() body: UpdateUserProfileDto,
		@Requester() requester: RequestedBy,
	): Promise<ProtectedUserResponseDto> {
		if (!Object.keys(body).length) {
			throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
		}

		return this.usersService.updateProfile(body, requester);
	}
}
