export const toConditionalValue = <TTrue, TFalse>(
	value: boolean | undefined,
	whenTrue: TTrue,
	whenFalse: TFalse,
): TTrue | TFalse | undefined => {
	return value === undefined ? undefined : value ? whenTrue : whenFalse;
};
