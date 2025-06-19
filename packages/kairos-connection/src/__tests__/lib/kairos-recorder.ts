import fs from 'fs/promises'
import path from 'path'
import * as MinimalImport from '../../minimal/kairos-minimal.js'
import { ResponseError } from '../../minimal/errors.js'

/**
 * This class connects to a Kairos ( /emulator), sends messages to it and stores the replies in a cache on disk.
 * This is useful for testing purposes.
 */
export class KairosRecorder {
	private _storedReplies: Record<string, string[]> = {}
	private _storedRepliesChanged = false

	private _onlineOnly = false

	connection: any
	constructor() {
		let MinimalKairosConnection = MinimalImport.MinimalKairosConnection
		// This is a hack to access the original, unmocked class:
		MinimalKairosConnection = (MinimalImport as any).OriginalMinimalKairosConnection

		this.connection = new MinimalKairosConnection({
			// port: 4000,
		})
	}
	async init(): Promise<void> {
		if (!this._onlineOnly) {
			const str = await fs.readFile(this.cacheFilePath, 'utf-8')
			this._storedReplies = str ? JSON.parse(str) : {}
		}

		if (!this.connection.connected) {
			await new Promise<void>((resolve) => {
				this.connection.on('connect', () => {
					resolve()
				})
			})
		}
	}
	async storeChanges(): Promise<void> {
		if (this._storedRepliesChanged && !this._onlineOnly) {
			await fs.writeFile(this.cacheFilePath, JSON.stringify(this._storedReplies, null, 2), 'utf-8')
			this._storedRepliesChanged = false
		}
	}
	private get cacheFilePath(): string {
		return path.join(__dirname, 'recorded-replies.json')
	}

	private _promiseQueue: Promise<any> = Promise.resolve()
	private async waitForSynchronousQueue<T>(fcn: () => Promise<T>): Promise<T> {
		// This is a simple synchronous queue to ensure that commands are executed in order.

		/* The previous promise in the queue to wait for. */
		const waitingForPrevious = this._promiseQueue

		const pReply = Promise.resolve().then(async () => {
			// First, wait for any previous commands to finish:
			try {
				await waitingForPrevious
			} catch {
				// ignore any rejected promises, they have already been handled
			}
			return fcn()
		})
		// Add
		this._promiseQueue = pReply

		return pReply
	}

	/** */
	async doCommand(message: string): Promise<string[] | null> {
		const cached = this._storedReplies[message]
		if (cached) return cached

		// Execute the commands in synchronous order:
		try {
			const reply = await this.waitForSynchronousQueue(async () => {
				return this.connection.executeCommand(message, (response: any) => ({
					remainingLines: [],
					response,
				}))
			})
			if (reply) {
				this._storedReplies[message] = reply
				this._storedRepliesChanged = true

				// await this.storeChanges()
			}

			return reply
		} catch (e) {
			if (e instanceof ResponseError) {
				if (e.sentCommand === message) {
					this._storedReplies[message] = [e.response]
					this._storedRepliesChanged = true
				} else {
					console.error('Got an error not related to what we sent:', e.sentCommand, message)
				}
			}
			throw e
		}
	}
}
