import { Injectable, OnModuleInit } from '@nestjs/common';
import { ManagementClient } from 'auth0';
import {
	AUTH0_CLIENT_ID,
	AUTH0_CLIENT_SECRET,
	AUTH0_DOMAIN,
} from './auth0.constants';

@Injectable()
export class Auth0Service implements OnModuleInit {
	private management: ManagementClient;

	onModuleInit() {
		this.management = new ManagementClient({
			clientId: AUTH0_CLIENT_ID,
			clientSecret: AUTH0_CLIENT_SECRET,
			domain: AUTH0_DOMAIN,
		});
	}

	get roles() {
		return this.management.roles;
	}

	get tickets() {
		return this.management.tickets;
	}

	get users() {
		return this.management.users;
	}
}
