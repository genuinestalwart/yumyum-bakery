import {
	ArrayNotEmpty,
	IsArray,
	IsBoolean,
	IsDate,
	IsEmail,
} from 'class-validator';
import Auth0 from 'src/auth0/auth0.types';
import { PartialUserResponseDto } from './partial-user-response.dto';

export class FullUserResponseDto extends PartialUserResponseDto {
	@IsBoolean()
	blocked: boolean;

	@IsDate()
	createdAt: string;

	@IsEmail()
	email: string;

	@IsBoolean()
	emailVerified: boolean;

	@IsArray()
	@ArrayNotEmpty()
	identities: Auth0.UserIdentity[];

	@IsDate()
	updatedAt: string;
}
