/**
 * An Error which is created when we receive an "Error" (or equivalent) in reply to a command.
 */
export class ResponseError extends Error {
	constructor(
		public readonly sentCommand: string,
		public readonly response: string
	) {
		super(`Error response received: ${response} in response to "${sentCommand}`)
		this.name = 'ResponseError'
	}
}
/**
 * An Error which is created when we receive a reply which is unknown to us.
 */
export class UnknownResponseError extends Error {
	constructor(
		public readonly sentCommand: string,
		public readonly response: string
	) {
		super(`Unknown response received: ${response} in response to "${sentCommand}`)
		this.name = 'UnknownResponseError'
	}
}

export class TerminateSubscriptionError extends Error {
	constructor(reason: string) {
		super(`Subscription has been terminated: ${reason}`)
		this.name = 'TerminateSubscriptionError'
	}
}
