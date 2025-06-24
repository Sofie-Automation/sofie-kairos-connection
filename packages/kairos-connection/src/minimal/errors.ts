export class ResponseError extends Error {
	constructor(
		public readonly sentCommand: string,
		public readonly response: string
	) {
		super(`Error response received: ${response} in response to "${sentCommand}`)
		this.name = 'ResponseError'
	}
}

export class TerminateSubscriptionError extends Error {
	constructor(reason: string) {
		super(`Subscription has been terminated: ${reason}`)
		this.name = 'TerminateSubscriptionError'
	}
}
