export function assertNever(_never: never): void {
	// Do nothing. This is a type guard
}
export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
