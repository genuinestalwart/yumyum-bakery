import { Injectable, OnModuleInit } from '@nestjs/common';
import { ManagementClient } from 'auth0';

@Injectable()
export class Auth0Service implements OnModuleInit {
	private management: ManagementClient;

	onModuleInit() {
		this.management = new ManagementClient({
			clientId: `${process.env.AUTH0_CLIENT_ID}`,
			clientSecret: `${process.env.AUTH0_CLIENT_SECRET}`,
			domain: `${process.env.AUTH0_DOMAIN}`,
		});
	}

	get users() {
		return this.management.users;
	}
}
