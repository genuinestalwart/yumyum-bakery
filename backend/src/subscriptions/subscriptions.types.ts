export const WEEK_DAYS = {
	MONDAY: 'onMondays',
	TUESDAY: 'onTuesdays',
	WEDNESDAY: 'onWednesdays',
	THURSDAY: 'onThursdays',
	FRIDAY: 'onFridays',
	SATURDAY: 'onSaturdays',
	SUNDAY: 'onSundays',
} as const;

export type WeekDay = keyof typeof WEEK_DAYS;
