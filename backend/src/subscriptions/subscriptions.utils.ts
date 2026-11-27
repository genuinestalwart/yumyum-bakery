import { Prisma } from 'prisma/generated/client';

export const include = {
	subscriptionItems: { omit: { subscriptionId: true } },
} satisfies Prisma.SubscriptionInclude;
