import { Logger } from '@nestjs/common';

export const createLogger = (context: string): Logger => {
	return new Logger(context, { timestamp: true });
};
