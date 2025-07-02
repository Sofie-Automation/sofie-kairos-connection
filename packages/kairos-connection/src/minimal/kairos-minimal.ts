// eslint-disable-next-line n/no-unsupported-features/node-builtins
import EventEmitter, { addAbortListener } from 'node:events'
import { randomUUID } from 'node:crypto'
import { Connection } from './connection.js'
import { TerminateSubscriptionError } from './errors.js'
import { ExpectedResponseType, InternalRequest, parseResponseForCommand } from './parser.js'

export interface Options {
	/** Host name of the machine to connect to. Defaults to 127.0.0.1 */
	host?: string
	/** Port number to connect to. Defaults to 3005 */
	port?: number
	/** Minimum amount of time before a request is considered to be timed out */
	timeoutTime?: number
	/** Immediately connects after instantiating the class, defaults to false */
	autoConnect?: boolean
}

export type KairosConnectionEvents = {
	connect: []
	disconnect: []
	error: [error: Error]
	warn: [error: Error]
	reset: []
}

/**
 * The `MinimalKairosConnection` class handles the basic connection to the Kairos server.
 * It provides the basic methods to send and receive messages over the SPKCP protocol, manage the connection state, and handle errors.
 */
export class MinimalKairosConnection extends EventEmitter<KairosConnectionEvents> {
	private _connection: Connection
	private _host: string
	private _port: number

	private _requestQueue: Array<InternalRequest> = []
	private _timeoutTimer: NodeJS.Timeout
	private _timeoutTime: number
	private _canSendCommands = false

	private _subscriptions: Map<string, SubscriptionState> = new Map()

	private _unprocessedLines: string[] = []

	constructor(options?: Options) {
		super()

		this._host = options?.host || '127.0.0.1'
		this._port = options?.port || 3005

		this._connection = new Connection(this._host, this._port, !(options?.autoConnect === false))

		this._connection.on('connect', () => {
			this._unprocessedLines = []
			this._canSendCommands = true

			this.emit('connect')
			this._processQueue().catch((e) => this.emit('error', e))
		})
		this._connection.on('disconnect', () => {
			this._unprocessedLines = []
			this.#terminateAllSubscriptions('Disconnected from KAIROS')

			this._requestQueue.forEach((r) => {
				r.reject(new Error('Disconnected before response was received'))
			})
			this._requestQueue = []

			this.emit('disconnect')
		})
		this._connection.on('error', (e) => this.emit('error', e))

		this._connection.on('lines', (lines) => {
			try {
				this._processResponses(lines)
			} catch (e) {
				this.emit('error', e as Error)
			}
		})

		this._timeoutTime = options?.timeoutTime || 5000
		this._timeoutTimer = setInterval(() => this._checkTimeouts(), this._timeoutTime)
	}

	private _processResponses(newLines: string[]): void {
		this._unprocessedLines.push(...newLines)

		while (this._unprocessedLines.length > 0) {
			const firstLine = this._unprocessedLines[0]

			if (firstLine.startsWith('APPLICATION:')) {
				this._unprocessedLines.shift()

				// TODO - will any in flight commands be ignored?
				// TODO - should unsent commands be rejected?

				// Invalidate all subscriptions
				this.#terminateAllSubscriptions('Application reset')

				this.emit('reset')
				continue
			}

			const pendingCommand = this._requestQueue[0]?.sentTime ? this._requestQueue[0] : undefined

			const parsedResponse = parseResponseForCommand(this._unprocessedLines, pendingCommand)
			this._unprocessedLines = parsedResponse.remainingLines

			if (parsedResponse.subscriptionValue) {
				// This is a response to a subscription or a query
				const { path, value } = parsedResponse.subscriptionValue

				const subscription = this._subscriptions.get(path)
				if (subscription) {
					subscription.latestValue = value

					this.#emitToAllSubscribers(subscription.subscribers, path, null, value)
				}
			}

			if (parsedResponse.connectionError) {
				this.emit('error', parsedResponse.connectionError)
			}

			if (parsedResponse.commandResponse) {
				this._requestQueue.shift() // Remove the command from the queue after processing

				if (parsedResponse.commandResponse.type === 'error') {
					pendingCommand?.reject(parsedResponse.commandResponse.error)
				} else {
					pendingCommand?.resolve(parsedResponse.commandResponse.value)
				}
			} else if (!parsedResponse.subscriptionValue) {
				// If this wasn't a subscription value, and command data is not yet ready, stop processing until this is handled
				break
			}
		}
	}

	get host(): string {
		return this._host
	}

	get port(): number {
		return this._port
	}

	get connected(): boolean {
		return this._connection.connected
	}

	connect(host?: string, port?: number): void {
		this._canSendCommands = false
		this._host = host ? host : this._host
		this._port = port ? port : this._port
		this._connection.changeConnection(this._host, this._port)
	}

	disconnect(): void {
		this.#terminateAllSubscriptions('Disconnected by user')
		this._canSendCommands = false
		this._connection.disconnect()
		this._requestQueue.forEach((r) => {
			r.reject(new Error('Disconnected before response was received'))
		})
		this._requestQueue = []
	}

	/** Stops internal timers so that the class is ready for garbage disposal */
	discard(): void {
		this._connection.disconnect()
		clearInterval(this._timeoutTimer)
	}

	/**
	 * Sends a command to the KAIROS
	 * @return { error: Error } if there was an error when sending the command (such as being disconnected)
	 * @return { request: Promise<Response> } a Promise that resolves when the KAIROS replies after a command has been sent.
	 * If this throws, there's something seriously wrong :)
	 */
	async executeCommand(
		commandStr: string,
		expectedResponse: ExpectedResponseType,
		expectedResponsePath: string | null
	): Promise<unknown> {
		if (!this._canSendCommands) throw new Error('Cannot send commands, not connected to KAIROS')

		const orgError = new Error() // To be used later in case of an Error

		const internalRequest: InternalRequest = {
			serializedCommand: commandStr,
			expectedResponse,
			expectedResponsePath,

			// stubs to be replaced
			resolve: () => null,
			reject: () => null,

			processed: false,
		}
		const request = new Promise<unknown>((resolve, reject) => {
			internalRequest.resolve = (val) => {
				process.nextTick(() => {
					try {
						resolve(val)
					} catch (e) {
						this.emit('error', e as Error)
					}
				})
			}
			internalRequest.reject = (err) => {
				process.nextTick(() => {
					try {
						reject(err)
					} catch (e) {
						this.emit('error', e as Error)
					}
				})
			}
		})

		this._requestQueue.push(internalRequest)
		this._processQueue().catch((e) => this.emit('error', e))

		try {
			return await request
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

	private async _processQueue(): Promise<void> {
		if (this._requestQueue.length < 1) return

		for (const r of this._requestQueue) {
			if (r.processed) continue

			r.processed = true
			r.processedTime = Date.now()

			this._connection
				.sendCommand(r.serializedCommand)
				.then((sendError) => {
					if (sendError) {
						this._requestQueue = this._requestQueue.filter((req) => req !== r)
						r.reject(sendError)
					} else {
						r.sentTime = Date.now()
					}
				})
				.catch((e: string) => {
					r.reject(new Error(e))
					this._requestQueue = this._requestQueue.filter((req) => req !== r)
				})
		}
	}

	private _checkTimeouts() {
		const deadRequests = this._requestQueue.filter(
			(req) => req.processed && req.processedTime && req.processedTime < Date.now() - this._timeoutTime
		)
		deadRequests.forEach((req) => {
			req.reject(new Error('Time out'))
		})
		this._requestQueue = this._requestQueue.filter((req) => !deadRequests.includes(req))
	}

	/**
	 * Set the value of an attribute on the KAIROS
	 * Note: This does not try to serialize the value, as it does not have enough context to do so.
	 * @param path The path of the attribute to set, e.g. `SCENES.Main.Layers.PGM.source_pgm`
	 * @param value The value to set the attribute to, e.g. `IP1`
	 * @returns A promise that resolves when the command has been sent to the KAIROS
	 */
	async setAttribute(path: string, value: string): Promise<void> {
		const commandStr = `${path}=${value}`
		await this.executeCommand(commandStr, ExpectedResponseType.OK, null)
	}
	/**
	 * Set the values of multiple attributes at the same path on the KAIROS
	 * Note: This does not try to serialize the values, as it does not have enough context to do so.
	 * @param path The path to the object to update, e.g. `SCENES.Main.Layers.PGM`
	 * @param attributes Array of the attributes on the path to set.
	 * @returns void
	 */
	async setAttributes(
		path: string,
		attributes: Array<{ attribute: string; value: string | undefined }>
	): Promise<void> {
		await Promise.all(
			attributes.map(
				async (attr) => attr.value !== undefined && this.setAttribute(`${path}.${attr.attribute}`, attr.value)
			)
		)
	}

	/**
	 * Get the value of an attribute from the KAIROS
	 * Note: This intentionally does not try to deserialize the value, as it does not have enough context to do so.
	 * @param path The path to the attribute to query, e.g. `SCENES.Main.Layers.PGM.source_pgm`
	 * @returns The value of the attribute as a string, or an error if the attribute could not be found
	 */
	async getAttribute(path: string): Promise<string> {
		// If a subscription is active for this path, return the cached value
		const subscription = this._subscriptions.get(path)
		if (subscription && subscription.latestValue !== null) return subscription.latestValue

		const commandStr = `${path}`
		const result = await this.executeCommand(commandStr, ExpectedResponseType.Query, path)

		if (typeof result !== 'string') {
			throw new Error(`Expected a string response for path "${path}", but got: ${result}`)
		}
		return result
	}
	/**
	 * Get the values of multiple attributes at the same path from the KAIROS
	 * @param path The path to the attribute to query, e.g. `SCENES.Main.Layers.PGM`
	 * @param names Array of the attributes on the path to query, eg `['source_pgm', 'source_pst']`
	 * @returns An key-value object where the keys are the attribute names and the values are the attribute values as strings.
	 */
	async getAttributes<const TNames extends readonly string[]>(
		path: string,
		names: TNames
	): Promise<{ [K in TNames[number]]: string }> {
		return Object.fromEntries(
			await Promise.all(names.map(async (name) => [name, await this.getAttribute(`${path}.${name}`)]))
		)
	}

	/**
	 * Get a list of items from the KAIROS
	 * This is used to query lists of items, such as sources, scenes, etc.
	 * @param path The path to the list to query, e.g. `SCENES.Main.Layers.PGM.sources`
	 * @returns The list of items in the list, or an error if the list could not be found
	 */
	async getList(path: string): Promise<string[]> {
		const commandStr = `list_ex:${path}`
		const result = await this.executeCommand(commandStr, ExpectedResponseType.List, path)

		if (!Array.isArray(result)) {
			throw new Error(`Expected a string array response for path "${path}", but got: ${result}`)
		}
		return result
	}

	async executeFunction(path: string, ...args: string[]): Promise<void> {
		// IP1.record=25,Output.rr\r\n
		const escapedArgs: string[] = []
		for (const arg of args) {
			// Escape:
			// , - &#44;
			// \r - &#13;
			// \n - &#10;

			escapedArgs.push(arg.replaceAll(',', '&#44;').replaceAll('\r', '&#13;').replaceAll('\n', '&#10;'))
		}
		await this.executeCommand(`${path}=${escapedArgs.join(',')}`, ExpectedResponseType.OK, null)
	}

	subscribeValue(
		path: string,
		abort: AbortSignal,
		rawCallback: SubscriptionCallback<string>,
		/** Whether to query for an initial value. If false, will only subscribe to future values */
		fetchCurrentValue = true
	): void {
		if (!this._canSendCommands) throw new Error('Cannot send commands, not connected to KAIROS')
		if (abort.aborted) throw new Error('Cannot subscribe, abort signal is already aborted')

		const subscriberId = randomUUID()

		// Create a local abort, to be used when we abort the subscription internally:
		// ( Since we can't abort the external AbortSignal. )
		const localAbort = new AbortController()
		const combinedAbortSignal = AbortSignal.any([abort, localAbort.signal])

		const wrappedCallback: SubscriptionCallback<string> = (path, error, value) => {
			if (combinedAbortSignal.aborted) return // If the abort signal is already aborted, do not call the callback

			// If an error is received, we should not call the callback again
			if (error) {
				localAbort.abort()
			}

			// Call the original callback with the path and value
			rawCallback(path, error, value)
		}

		let needsToQueryValue = false

		let subscription = this._subscriptions.get(path)
		if (subscription) {
			subscription.subscribers.set(subscriberId, wrappedCallback)

			if (subscription.latestValue !== null && fetchCurrentValue) {
				const latestValue = subscription.latestValue
				// If we already have a value, call the callback immediately
				process.nextTick(() => {
					wrappedCallback(path, null, latestValue)
				})
			} else {
				// If we don't have a value, we need to query it
				needsToQueryValue = true
			}
		} else {
			// Create a new subscription state
			subscription = {
				id: randomUUID(),
				subscribers: new Map([[subscriberId, wrappedCallback]]),
				latestValue: null,
			}
			this._subscriptions.set(path, subscription)
			needsToQueryValue = true

			// start a subscription to the KAIROS for this path
			const newSubcription = subscription
			this.executeCommand(`subscribe:${path}`, ExpectedResponseType.OK, null).catch((e) => {
				this.#terminateSubscription(path, newSubcription, e as Error)
			})
		}

		if (needsToQueryValue && fetchCurrentValue) {
			const commandStr = `${path}`
			this.executeCommand(commandStr, ExpectedResponseType.Query, path)
				.then((res) => {
					if (typeof res !== 'string') {
						throw new Error(`Expected a string response for path "${path}", but got: ${res}`)
					}

					// If the subscription already has a value, we don't need to update it
					if (subscription.latestValue !== null) return

					subscription.latestValue = res

					this.#emitToAllSubscribers(subscription.subscribers, path, null, res)
				})
				.catch((e) => {
					this.#terminateSubscription(path, subscription, e as Error)
				})
		}

		// Listen for the abort, to remove the listener from the subscription and stop the subscription if needed
		addAbortListener(combinedAbortSignal, () => {
			const subscription = this._subscriptions.get(path)
			if (!subscription) return // Should not happen, but just in case

			subscription.subscribers.delete(subscriberId)

			// If there are no subscribers left, remove the subscription
			if (subscription.subscribers.size === 0) {
				this._subscriptions.delete(path)

				// stop the subscription to the KAIROS for this path
				this.executeCommand(`unsubscribe:${path}`, ExpectedResponseType.OK, null).catch((e) => {
					// TODO - wrap error?
					this.emit('warn', e)
				})
			}
		})
	}

	#terminateSubscription(path: string, subscription: SubscriptionState, error: Error): void {
		// Inform the subscribers of the failure
		this.#emitToAllSubscribers(subscription.subscribers, path, error, null)

		// Terminate the subscription
		const currentSubscription = this._subscriptions.get(path)
		if (!currentSubscription || currentSubscription.id !== subscription.id) return // Make sure the same subscription is still active
		this._subscriptions.delete(path)
	}

	#emitToAllSubscribers(
		subscribers: Map<string, SubscriptionCallback<string>>,
		path: string,
		error: Error | null,
		value: string | null
	) {
		for (const callback of subscribers.values()) {
			// Call the callback with the path and the value
			try {
				callback(path, error, value)
			} catch (e) {
				this.emit('error', e as Error)
			}
		}
	}

	#terminateAllSubscriptions(reason: string) {
		const error = new TerminateSubscriptionError(reason)

		for (const [path, subscription] of this._subscriptions.entries()) {
			// Defer to ensure the subscription map is empty before the callbacks execute
			process.nextTick(() => {
				// Inform the subscribers of the failure
				this.#emitToAllSubscribers(subscription.subscribers, path, error, null)
			})
		}

		this._subscriptions.clear()
	}
}

interface SubscriptionState {
	readonly id: string // Unique ID for the subscription, to identify if it has been restarted
	readonly subscribers: Map<string, SubscriptionCallback<string>>
	latestValue: string | null
}

export type SubscriptionCallback<TValue> = (path: string, error: Error | null, value: TValue | null) => void
