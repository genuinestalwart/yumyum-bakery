import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { auth } from 'express-oauth2-jwt-bearer';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
	private checkJWT = auth({
		audience: `${process.env.AUTH0_IDENTIFIER}`,
		issuerBaseURL: `${process.env.AUTH0_TENANT}`,
	});

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();

		return new Promise<boolean>((resolve, reject) => {
			this.checkJWT(request, response, (error: any) => {
				if (error) {
					return reject(new UnauthorizedException());
				}

				resolve(true);
			});
		});
	}
}
