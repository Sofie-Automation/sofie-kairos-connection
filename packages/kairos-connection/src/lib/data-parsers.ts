export function parseBoolean(value: string): boolean {
	return value === '1'
}
export function stringifyBoolean(value: boolean): string
export function stringifyBoolean(value: undefined): undefined
export function stringifyBoolean(value: boolean | undefined): string | undefined
export function stringifyBoolean(value: boolean | undefined): string | undefined {
	if (value === undefined) return undefined
	return value ? '1' : '0'
}
export function parseCommaSeparated(value: string): string[] {
	return value.split(',').filter((v) => v.trim() !== '')
}
export function stringifyCommaSeparated(values: string[]): string
export function stringifyCommaSeparated(values: undefined): undefined
export function stringifyCommaSeparated(values: string[] | undefined): string | undefined
export function stringifyCommaSeparated(values: string[] | undefined): string | undefined {
	if (values === undefined) return undefined
	return values.join(',')
	// TODO:end with a ',' ?
}

export function stringifyInt(value: number | undefined): string | undefined {
	if (value === undefined) return undefined
	return value.toString()
}
export function stringifyFloat(value: number | undefined): string | undefined {
	if (value === undefined) return undefined
	return value.toString()
}
export function parseEnum<EnumType>(value: string, theEnum: { [key: string]: any }): EnumType {
	const values = Object.values<any>(theEnum)
	if (values.includes(value) !== undefined) return value as any

	throw new Error(`Invalid enum value: ${value}, valid values: ${values.join(', ')}`)
}
export function stringifyEnum(value: undefined, theEnum: { [key: string]: any }): undefined
export function stringifyEnum<EnumType>(
	value: EnumType | undefined,
	theEnum: { [key: string]: any }
): string | undefined
export function stringifyEnum<EnumType>(value: EnumType, theEnum: { [key: string]: any }): string
export function stringifyEnum<EnumType>(
	value: EnumType | undefined,
	theEnum: { [key: string]: any }
): string | undefined {
	if (value === undefined) return undefined

	const values = Object.values<any>(theEnum)
	if (values.includes(value) !== undefined) return value as any

	console.log('theEnum', theEnum)
	throw new Error(`Invalid enum value: ${value}, valid values: ${values.join(', ')}`)
}
