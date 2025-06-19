export class ResponseError extends Error {
	constructor(
		public readonly sentCommand: string,
		public readonly response: string
	) {
		super(`Error response received: ${response} in response to "${sentCommand}`)
		this.name = 'ResponseError'
	}
}
