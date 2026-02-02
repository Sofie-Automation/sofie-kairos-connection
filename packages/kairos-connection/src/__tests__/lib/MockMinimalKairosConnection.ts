import { KairosConnection, MinimalKairosConnection, SubscriptionCallback } from '../../main.js'
import { parseResponseForCommand, ExpectedResponseType } from '../../minimal/parser.js'
import { ResponseError } from '../../minimal/errors.js'

export interface IMockLoggedMessage {
	type: 'received' | 'sent'
	message: string
}
export interface IMockMinimalKairosConnection extends MinimalKairosConnection {
	isAMock: boolean

	mockCaptureTraffic(
		callback: (messageLog: {
			receivedMessages: string[]
			sentMessages: string[]
			allMessages: IMockLoggedMessage[]
		}) => Promise<void> | void
	): Promise<void>

	mockSetReplyHandler: (
		handler: (
			message: string,
			expectedResponse: ExpectedResponseType,
			expectedResponsePath: string | null
		) => Promise<string[]>
	) => void
	mockSetSubscribeValue: (handler: (path: string, abort: AbortSignal, callback: any) => void) => void
}

export type MockedKairosConnection = IMockMinimalKairosConnection & InstanceType<typeof KairosConnection>

export const getMockMinimalKairosConnection: () => {
	mockConnections(): MinimalKairosConnection[]
	clearMockConnections(): void
	getClass(originalClass: typeof MinimalKairosConnection): typeof MinimalKairosConnection & {
		new (...args: any[]): IMockMinimalKairosConnection
	}
} = () => {
	const connections: Array<MinimalKairosConnection> = []

	return {
		mockConnections(): MinimalKairosConnection[] {
			return connections
		},

		clearMockConnections(): void {
			connections.splice(0, connections.length)
		},
		getClass: (originalClass: typeof MinimalKairosConnection) => {
			// This uses extends the original class, and replaces some of the
			class MockKairosMinimalConnectionInstance extends originalClass implements IMockMinimalKairosConnection {
				private _mockConnected = false
				private _replyHandler: (
					commandStr: string,
					expectedResponse: ExpectedResponseType,
					expectedResponsePath: string | null
				) => Promise<string[]> = () => {
					throw new Error('No reply handler set')
				}
				private _mockSubscribeValue: (
					path: string,
					abort: AbortSignal,
					callback: SubscriptionCallback<string>,
					fetchCurrentValue: boolean
				) => void = () => {
					throw new Error('No subscribe handler set')
				}

				public isAMock = true

				get connected(): boolean {
					return this._mockConnected
				}

				connect(_host?: string, _port?: number): void {
					this._mockConnected = true
				}

				disconnect(): void {
					this._mockConnected = false
				}
				discard(): void {
					this._mockConnected = false
				}
				async executeCommand<TRes>(
					commandStr: string,
					expectedResponse: ExpectedResponseType,
					expectedResponsePath: string | null
				): Promise<TRes> {
					const orgError = new Error()
					try {
						this.mockLogTraffic({ type: 'sent', message: commandStr })
						const replyLines = await this._replyHandler(commandStr, expectedResponse, expectedResponsePath)

						for (const line of replyLines) {
							this.mockLogTraffic({ type: 'received', message: line })
						}

						if (replyLines.length === 1 && replyLines[0] === 'Error') {
							throw new ResponseError(commandStr, replyLines[0])
						}

						const response = parseResponseForCommand(replyLines, {
							serializedCommand: commandStr,
							expectedResponse,
							expectedResponsePath,
						})
						if (response.remainingLines.length > 0) {
							throw new Error('Mock error: Unexpected remaining lines: ' + response.remainingLines.join(', '))
						}
						if (response.connectionError) {
							this.emit('error', response.connectionError)
						}

						if (!response.commandResponse) {
							throw new Error(`No reply received for command: ${commandStr}`)
						}
						if (response.commandResponse.type === 'error') {
							throw response.commandResponse.error
						} else {
							return response.commandResponse.value as TRes
						}
					} catch (e) {
						if (e instanceof Error) {
							// Append context to error message:
							e.message += ` (in response to ${commandStr} )`

							// Append original call stack to the error:
							const orgStack = `${orgError.stack}`.replace('Error: \n', '')

							if (e.stack) {
								e.stack = `${e.stack}\n--- Original stack: -------------------\n${orgStack}`
							} else {
								e.stack = orgStack
							}
						}
						throw e
					}
				}

				// ------------ Mock methods --------------------------------------------------------------------------

				public mockSetReplyHandler(
					handler: (
						message: string,
						expectedResponse: ExpectedResponseType,
						expectedResponsePath: string | null
					) => Promise<string[]>
				) {
					this._replyHandler = handler
				}

				public mockSetSubscribeValue(
					handler: (path: string, abort: AbortSignal, callback: SubscriptionCallback<string>) => void
				) {
					this._mockSubscribeValue = handler
				}

				/** Log traffic during execution of a callback */
				public async mockCaptureTraffic(
					callback: (messageLog: {
						receivedMessages: string[]
						sentMessages: string[]
						allMessages: IMockLoggedMessage[]
					}) => Promise<void> | void
				) {
					const messageLog: {
						receivedMessages: string[]
						sentMessages: string[]
						allMessages: IMockLoggedMessage[]
					} = {
						receivedMessages: [],
						sentMessages: [],
						allMessages: [],
					}
					const listener = (msg: IMockLoggedMessage) => {
						if (msg.type === 'received') messageLog.receivedMessages.push(msg.message)
						else if (msg.type === 'sent') messageLog.sentMessages.push(msg.message)
						messageLog.allMessages.push(msg)
					}
					this.logListeners.push(listener)

					// Execute callback
					try {
						await callback(messageLog)
					} finally {
						// Clean up:
						this.logListeners = this.logListeners.filter((cb) => cb !== listener)
					}
				}
				private logListeners: ((msg: IMockLoggedMessage) => void)[] = []
				private mockLogTraffic(msg: IMockLoggedMessage) {
					this.logListeners.forEach((cb) => cb(msg))
				}

				// Override subscribeValue to use mock if set
				subscribeValue(
					path: string,
					abort: AbortSignal,
					callback: SubscriptionCallback<string>,
					fetchCurrentValue = true
				): void {
					this._mockSubscribeValue(path, abort, callback, fetchCurrentValue)
				}
			}
			return MockKairosMinimalConnectionInstance
		},
	}
}
