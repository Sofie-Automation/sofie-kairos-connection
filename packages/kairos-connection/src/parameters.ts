export interface CustomParams {
	/** Optional custom parameters that will be appended to any command */
	customParams?: Record<string, string | number | boolean | null>
}

export type Empty = CustomParams & Record<string, never>

export interface CustomCommandParameters extends CustomParams {
	command: string
}
