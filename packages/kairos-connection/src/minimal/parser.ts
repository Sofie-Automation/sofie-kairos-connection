import { assertNever } from '../lib/lib.js'
import { ResponseError, UnknownResponseError } from './errors.js'

const MAX_LIST_LENGTH = 1000 // Maximum number of items in a list before we consider it too large to be plausible

export enum ExpectedResponseType {
	OK = 'OK',
	Query = 'Query',
	List = 'List',
}

export interface InternalRequest {
	serializedCommand: string
	expectedResponse: ExpectedResponseType
	expectedResponsePath: string | null // If this is a query/list_ex, the path expected in the response line

	resolve: (response: any) => void
	reject: (error: Error) => void

	processed: boolean
	processedTime?: number
	sentTime?: number
}

export function parseResponseForCommand(
	unprocessedLines: string[],
	pendingCommand: Pick<InternalRequest, 'serializedCommand' | 'expectedResponse' | 'expectedResponsePath'> | undefined
): {
	remainingLines: string[]
	subscriptionValue: { path: string; value: string } | null
	connectionError?: Error

	commandResponse:
		| {
				type: 'ok'
				value: any
		  }
		| {
				type: 'error'
				error: Error
		  }
		| null
} {
	// Example of replies:
	// list_ex:SCENES.Main.Snapshots=
	// SCENES.Main.Snapshots.SNP1
	// SCENES.Main.Snapshots.SNP1.dissolve_time=0
	// RR1.timecode=00:00:00:00
	// OK
	// Error
	// Permission Error
	const firstLine = unprocessedLines[0]

	// First try treating the line as a query value, which could satisfy a subscription and/or the first command in the queue
	const equalsIndex = firstLine.indexOf('=')
	if (
		equalsIndex !== -1 &&
		!firstLine.startsWith('list_ex:') // Not a response to a list_ex
	) {
		// This looks like a response to a subscription or a query
		const path = firstLine.slice(0, equalsIndex)
		const value = firstLine.slice(equalsIndex + 1)

		// If the first command in the queue is a query for this value, we can resolve it
		const matchesCommand =
			pendingCommand &&
			pendingCommand.expectedResponse === ExpectedResponseType.Query &&
			pendingCommand.expectedResponsePath === path

		return {
			remainingLines: unprocessedLines.slice(1),
			subscriptionValue: { path, value },
			commandResponse: matchesCommand ? { type: 'ok', value } : null,
		}
	}

	if (pendingCommand) {
		// command has been sent, we can match the response to it
		// If an error was received, reject the command
		if (
			firstLine === 'Error' ||
			firstLine.endsWith(' Error') // matches "Permission Error"
		) {
			return {
				remainingLines: unprocessedLines.slice(1),
				subscriptionValue: null,
				commandResponse: {
					type: 'error',
					error: new ResponseError(pendingCommand.serializedCommand, firstLine),
				},
			}
		}

		switch (pendingCommand.expectedResponse) {
			case ExpectedResponseType.Query: {
				// Handled above, should never reach here
				const error = new Error(`Internal Error: A Query responseType was NOT handled above`)
				return {
					remainingLines: unprocessedLines.slice(1),
					subscriptionValue: null,
					connectionError: error,
					commandResponse: {
						type: 'error',
						error: error,
					},
				}
			}
			case ExpectedResponseType.OK:
				// OK response, resolve the command
				if (firstLine === 'OK') {
					return {
						remainingLines: unprocessedLines.slice(1),
						subscriptionValue: null,
						commandResponse: { type: 'ok', value: undefined },
					}
				} else {
					return {
						remainingLines: unprocessedLines.slice(1),
						subscriptionValue: null,
						commandResponse: {
							type: 'error',
							error: new UnknownResponseError('Unknown response received', pendingCommand.serializedCommand, firstLine),
						},
					}
				}
			case ExpectedResponseType.List: {
				if (!pendingCommand.expectedResponsePath || firstLine !== `list_ex:${pendingCommand.expectedResponsePath}=`) {
					return {
						remainingLines: unprocessedLines.slice(1),
						subscriptionValue: null,
						commandResponse: {
							type: 'error',
							error: new UnknownResponseError('Unknown response received', pendingCommand.serializedCommand, firstLine),
						},
					}
				}

				const emptyLineIndex = unprocessedLines.indexOf('')
				if (emptyLineIndex !== -1) {
					const listItems = unprocessedLines.slice(1, emptyLineIndex)

					return {
						remainingLines: unprocessedLines.slice(emptyLineIndex + 1),
						subscriptionValue: null,
						commandResponse: {
							type: 'ok',
							value: listItems,
						},
					}
				} else if (unprocessedLines.length > MAX_LIST_LENGTH) {
					// A safety net, to avoid getting stuck in an infinite loop

					return {
						remainingLines: [], // clear the incoming queue
						subscriptionValue: null,
						commandResponse: {
							type: 'error',
							error: new UnknownResponseError(
								'No terminating line break received',
								pendingCommand.serializedCommand,
								// Log first and last 10 lines:
								[...unprocessedLines.slice(0, 10), '[...]', ...unprocessedLines.slice(-10)].join('\n')
							),
						},
					}
				} else {
					// Data not yet ready, stop processing lines
					// To revisit later when a complete response has arrived
					return {
						remainingLines: unprocessedLines,
						subscriptionValue: null,
						commandResponse: null, // Not handled yet, will be revisited later
					}
				}
			}
			default:
				assertNever(pendingCommand.expectedResponse)

				return {
					remainingLines: unprocessedLines.slice(1),
					subscriptionValue: null,
					commandResponse: {
						type: 'error',
						error: new UnknownResponseError('Unknown response received', pendingCommand.serializedCommand, firstLine),
					},
				}
		}
	} else {
		return {
			remainingLines: unprocessedLines.slice(1), // Remove the first line, as it has been processed
			subscriptionValue: null,
			commandResponse: null, // Not handled yet, will be revisited later
			connectionError: new Error(`Unexpected line received (no command is pending): ${firstLine}`),
		}
	}
}
