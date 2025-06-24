import EventEmitter from 'node:events'
import { randomUUID } from 'node:crypto'
import { Connection } from './connection.js'
import {
	queryAttributeDeserializer,
	okOrErrorDeserializer,
	listDeserializer,
	type DeserializeResult,
} from './deserializers.js'
import { ResponseError } from './errors.js'

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

type Deserializer<TRes> = (lineBuffer: readonly string[]) => DeserializeResult<TRes> | null

interface InternalRequest {
	serializedCommand: string
	isQuery: boolean
	deserializer: Deserializer<any>

	resolve: (response: any) => void
	reject: (error: Error) => void

	processed: boolean
	processedTime?: number
	sentTime?: number
}

export type KairosConnectionEvents = {
	connect: []
	disconnect: []
	error: [error: Error]
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
			this.emit('disconnect')
		})
		this._connection.on('error', (e) => this.emit('error', e))

		this._connection.on('lines', (lines) => {
			this._unprocessedLines.push(...lines)

			this._processResponses().catch((e) => this.emit('error', e))
		})

		this._timeoutTime = options?.timeoutTime || 5000
		this._timeoutTimer = setInterval(() => this._checkTimeouts(), this._timeoutTime)
	}

	private async _processResponses(): Promise<void> {
		while (this._unprocessedLines.length > 0) {
			const firstLine = this._unprocessedLines[0]

			if (firstLine.startsWith('APPLICATION:')) {
				this._unprocessedLines.shift()

				// TODO - invalidate any active subscriptions
				// TODO - will any in flight commands be ignored?
				// TODO - should unsent commands be rejected?

				this.emit('reset')
				continue
			}

			// Special case to handle values from subscriptions
			const equalsIndex = firstLine.indexOf('=') // TODO - this feels like a messy hack
			if (equalsIndex !== -1) {
				// This looks like a response to a subscription or a query
				const path = firstLine.slice(0, equalsIndex)
				const value = firstLine.slice(equalsIndex + 1)

				const subscription = this.#subscriptions.get(path)
				if (subscription) {
					subscription.latestValue = value

					this.#emitToAllSubscribers(subscription.subscribers, path, value)
				}
			}

			const nextCommand = this._requestQueue[0]
			if (
				// TODO - this feels like a messy hack
				equalsIndex !== -1 &&
				!firstLine.endsWith('=') &&
				(!nextCommand || (nextCommand && nextCommand.sentTime && !nextCommand.isQuery))
			) {
				// This looks like a value for a subcription, and does not match the queued command
				this._unprocessedLines.shift()
				continue
			}

			if (nextCommand && nextCommand.sentTime) {
				// command has been sent, we can match the response to it

				// If an error was received, reject the command
				if (firstLine.startsWith('Error')) {
					nextCommand.reject(new ResponseError(nextCommand.serializedCommand, firstLine))

					this._unprocessedLines.shift()
					this._requestQueue.shift() // Remove the command from the queue after processing
					continue
				}

				try {
					const res = nextCommand.deserializer(this._unprocessedLines)
					if (!res) {
						// Data not yet ready, stop processing
						return
					}

					this._unprocessedLines = res.remainingLines
					nextCommand.resolve(res.response)

					this._requestQueue.shift() // Remove the command from the queue after processing
				} catch (e: unknown) {
					nextCommand.reject(e as Error)

					// Unknown line, skip it so that we don't get stuck
					this._unprocessedLines.shift()

					this._requestQueue.shift() // Remove the command from the queue after processing
				}
			} else {
				// Unexpected response, no command is in flight
				this.emit('error', new Error(`Unknown line received: ${firstLine}`))

				// Unknown line, skip it so that we don't get stuck
				this._unprocessedLines.shift()
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
	async executeCommand<TRes>(
		commandStr: string,
		deserializer: Deserializer<TRes>,
		isQueryAttribute: boolean
	): Promise<TRes> {
		if (!this._canSendCommands) throw new Error('Cannot send commands, not connected to KAIROS')

		const orgError = new Error() // To be used later in case of an Error

		const internalRequest: InternalRequest = {
			serializedCommand: commandStr,
			isQuery: isQueryAttribute,
			deserializer,

			// stubs to be replaced
			resolve: () => null,
			reject: () => null,

			processed: false,
		}
		const request = new Promise<TRes>((resolve, reject) => {
			internalRequest.resolve = resolve
			internalRequest.reject = reject
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
		return this.executeCommand(commandStr, okOrErrorDeserializer, false)
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
		const subscription = this.#subscriptions.get(path)
		if (subscription && subscription.latestValue !== null) return subscription.latestValue

		const commandStr = `${path}`
		return this.executeCommand(commandStr, (lineBuffer) => queryAttributeDeserializer(lineBuffer, path), true)
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
		return this.executeCommand(commandStr, (lineBuffer) => listDeserializer(lineBuffer, path), false)
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
		return this.executeCommand(`${path}=${escapedArgs.join(',')}`, okOrErrorDeserializer, false)
	}

	#subscriptions: Map<string, SubscriptionState> = new Map()

	subscribeValue(path: string, callback: SubscriptionCallback): UnsubscribeFn {
		const subscriberId = randomUUID()

		let queryValue = false

		let subscription = this.#subscriptions.get(path)
		if (subscription) {
			subscription.subscribers.set(subscriberId, callback)

			if (subscription.latestValue !== null) {
				const latestValue = subscription.latestValue
				// If we already have a value, call the callback immediately
				process.nextTick(() => callback(path, latestValue))
			} else {
				// If we don't have a value, we need to query it
				queryValue = true
			}
		} else {
			// Create a new subscription state
			subscription = {
				subscribers: new Map([[subscriberId, callback]]),
				latestValue: null,
			}
			this.#subscriptions.set(path, subscription)
			queryValue = true

			// start a subscription to the KAIROS for this path
			this.executeCommand(`subscribe:${path}`, okOrErrorDeserializer, false).catch((e) => {
				// TODO - wrap error?
				// TODO - should this be propogated to the callback?
				// TODO - should this abort the subscription?
				this.emit('error', e)
			})
		}

		if (queryValue) {
			const commandStr = `${path}`
			this.executeCommand(commandStr, (lineBuffer) => queryAttributeDeserializer(lineBuffer, path), true)
				.then((res) => {
					// If the subscription already has a value, we don't need to update it
					if (subscription.latestValue !== null) return

					subscription.latestValue = res

					this.#emitToAllSubscribers(subscription.subscribers, path, res)
				})
				.catch((e) => {
					// TODO - wrap error?
					// TODO - should this be propogated to the callback?
					// TODO - should this abort the subscription?
					this.emit('error', e)
				})
		}

		// Return an unsubscribe function that will remove the subscriber from the subscription
		return () => {
			const subscription = this.#subscriptions.get(path)
			if (!subscription) return // Should not happen, but just in case

			subscription.subscribers.delete(subscriberId)

			// If there are no subscribers left, remove the subscription
			if (subscription.subscribers.size === 0) {
				this.#subscriptions.delete(path)

				// stop the subscription to the KAIROS for this path
				this.executeCommand(`unsubscribe:${path}`, okOrErrorDeserializer, false).catch((e) => {
					// TODO - wrap error?
					this.emit('error', e)
				})
			}
		}
	}

	#emitToAllSubscribers(subscribers: Map<string, SubscriptionCallback>, path: string, value: string) {
		for (const callback of subscribers.values()) {
			// Call the callback with the path and the value
			try {
				callback(path, value)
			} catch (e) {
				this.emit('error', e as Error)
			}
		}
	}
}

interface SubscriptionState {
	readonly subscribers: Map<string, SubscriptionCallback>
	latestValue: string | null
}

export type UnsubscribeFn = () => void
export type SubscriptionCallback = (path: string, value: string) => void
