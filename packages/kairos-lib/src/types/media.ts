export interface MediaObject {
	name: string
	/** int, 0 = not loaded, 1 = loading, 2 = loaded*/
	status: number
	/** float, 0.0-1.0 */
	readonly loadProgress: number
}
