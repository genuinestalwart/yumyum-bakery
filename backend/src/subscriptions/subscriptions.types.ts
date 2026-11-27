export const ON_DAYS = {
	MONDAY: 'onMondays',
	TUESDAY: 'onTuesdays',
	WEDNESDAY: 'onWednesdays',
	THURSDAY: 'onThursdays',
	FRIDAY: 'onFridays',
	SATURDAY: 'onSaturdays',
	SUNDAY: 'onSundays',
} as const;

export type OnDays = keyof typeof ON_DAYS;
export type Day = (typeof ON_DAYS)[OnDays];
