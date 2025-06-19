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
