export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
export function omitFalsy<T>(list: (T | undefined | null)[]): T[] {
	return list.filter(Boolean) as T[]
}
