import { Injectable, OnModuleInit } from '@nestjs/common';
import { ManagementClient } from 'auth0';

@Injectable()
export class Auth0Service implements OnModuleInit {
	private management: ManagementClient;

	onModuleInit() {
		this.management = new ManagementClient({
			clientId: process.env.AUTH0_CLIENT_ID as string,
			clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
			domain: process.env.AUTH0_DOMAIN as string,
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
