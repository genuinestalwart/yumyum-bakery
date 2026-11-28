import { Prisma } from 'prisma/generated/client';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';

export const include = {
	subscriptionItems: { omit: { subscriptionId: true } },
} satisfies Prisma.SubscriptionInclude;

export const serializeSubscription = (
	subscription: Prisma.SubscriptionGetPayload<{ include: typeof include }>,
): SubscriptionResponseDto => {
	const {
		deliveryCity,
		deliveryLatitude,
		deliveryLongitude,
		deliveryPostalCode,
		deliveryStreet,
		...rest
	} = subscription;

	return {
		...rest,
		location: {
			deliveryCity,
			deliveryLatitude,
			deliveryLongitude,
			deliveryPostalCode,
			deliveryStreet,
		},
	};
};
