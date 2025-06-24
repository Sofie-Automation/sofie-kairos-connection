export function parseBoolean(value: string): boolean {
	if (value === '1') return true
	if (value === '0') return false
	throw new Error(`Unable to parse boolean from string: "${value}"`)
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

export function parseInteger(value: string): number {
	const parsed = parseInt(value, 10)
	if (isNaN(parsed)) throw new Error(`Unable to parse integer from string: "${value}"`)
	return parsed
}
export function stringifyInteger(value: undefined): undefined
export function stringifyInteger(value: number): string
export function stringifyInteger(value: number | undefined): string | undefined
export function stringifyInteger(value: number | undefined): string | undefined {
	if (value === undefined) return undefined
	return value.toString()
}
export function parseFloatValue(value: string): number {
	const parsed = parseFloat(value)
	if (isNaN(parsed)) throw new Error(`Unable to parse float from string: "${value}"`)
	return parsed
}
export function stringifyFloat(value: undefined): undefined
export function stringifyFloat(value: number): string
export function stringifyFloat(value: number | undefined): string | undefined
export function stringifyFloat(value: number | undefined): string | undefined {
	if (value === undefined) return undefined
	return value.toString()
}
export function parseEnum<EnumType>(value: string, theEnum: { [key: string]: any }): EnumType {
	const values = Object.values<any>(theEnum)
	if (values.includes(value)) return value as any

	throw new Error(`Invalid enum value: ${JSON.stringify(value)}, valid values: ${values.join(', ')}`)
}
export function stringifyEnum(value: undefined, theEnum: { [key: string]: any }): undefined
export function stringifyEnum<EnumType>(value: EnumType, theEnum: { [key: string]: any }): string
export function stringifyEnum<EnumType>(
	value: EnumType | undefined,
	theEnum: { [key: string]: any }
): string | undefined
export function stringifyEnum<EnumType>(
	value: EnumType | undefined,
	theEnum: { [key: string]: any }
): string | undefined {
	if (value === undefined) return undefined

	const values = Object.values<any>(theEnum)

	if (values.includes(value)) return value as any

	throw new Error(`Invalid enum value: ${JSON.stringify(value)}, valid values: ${values.join(', ')}`)
}
