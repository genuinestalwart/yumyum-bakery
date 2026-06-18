import { Role } from './roles.types';

declare global {
	namespace Express {
		interface Request {
			user?: { id: string; role: Role };
		}
	}
}
