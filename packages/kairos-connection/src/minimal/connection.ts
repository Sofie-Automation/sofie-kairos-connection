import EventEmitter from 'node:events'
import { Socket } from 'node:net'

export type ConnectionEvents = {
	lines: [lines: string[]]
	connect: []
	disconnect: []
	error: [error: Error]
}

const KEEPALIVE_INTERVAL = 5000

export class Connection extends EventEmitter<ConnectionEvents> {
	private _socket?: Socket
	private _unprocessedData = ''
	private _reconnectTimeout?: NodeJS.Timeout
	private _connected = false

	private _keepaliveTimer?: NodeJS.Timeout
	private _lastMessageSentTime = 0

	private _debug = false

	constructor(
		private host: string,
		private port = 3005,
		autoConnect: boolean
	) {
		super()
		if (autoConnect) this._setupSocket()
	}

	get connected(): boolean {
		return this._connected
	}

	changeConnection(host: string, port = 3005): void {
		this.host = host
		this.port = port

		this._setupSocket()
	}

	disconnect(): void {
		this._socket?.end()

		if (this._keepaliveTimer) {
			clearTimeout(this._keepaliveTimer)
			this._keepaliveTimer = undefined
		}
	}

	async sendCommand(payload: string): Promise<Error | undefined> {
		this._lastMessageSentTime = Date.now()

		if (this._debug) console.debug(`Sending command: ${payload}`)
		return new Promise<Error | undefined>((r) => {
			this._socket?.write(payload + '\r\n', (e) => (e ? r(e) : r(undefined)))
		})
	}

	private _processIncomingData(data: Buffer) {
		if (this._debug) console.debug(`Received data: ${data.toString('utf-8')}`)
		/**
		 * This is a simple strategy to handle receiving newline separated data, factoring in arbitrary TCP fragmentation.
		 * It is common for a long response to be split across multiple packets, most likely with the split happening in the middle of a line.
		 */
		this._unprocessedData += data.toString('utf-8')
		const newLines = this._unprocessedData.split('\r\n')
		// Pop and preserve the last fragment as unprocessed. In most cases this will be an empty string, but it could be the first portion of a line
		this._unprocessedData = newLines.pop() ?? ''

		if (newLines.length > 0) this.emit('lines', newLines)
	}

	private _triggerReconnect() {
		if (!this._reconnectTimeout) {
			this._reconnectTimeout = setTimeout(() => {
				this._reconnectTimeout = undefined

				if (!this._connected) this._setupSocket()
			}, 5000)
		}
	}

	private _setupSocket() {
		if (this._socket) {
			this._socket.removeAllListeners()
			if (!this._socket.destroyed) {
				this._socket.destroy()
			}
		}

		this._socket = new Socket()
		this._socket.setEncoding('utf-8')

		this._socket.on('data', (data) => {
			try {
				this._processIncomingData(data)
			} catch (e: any) {
				this.emit('error', e)
			}
		})
		this._socket.on('connect', () => {
			this._setConnected(true)

			// Any data which hasn't been parsed yet is now incomplete, and can be discarded
			this._discardUnprocessed()
		})
		this._socket.on('close', () => {
			this._discardUnprocessed()

			this._setConnected(false)
			this._triggerReconnect()
		})
		this._socket.on('error', (e) => {
			this._discardUnprocessed()

			if (`${e}`.match(/ECONNREFUSED/)) {
				// Unable to connect, no need to handle this error
				this._setConnected(false)
			} else {
				this.emit('error', e)
			}
		})

		this._socket.connect(this.port, this.host)
	}

	private _discardUnprocessed() {
		this._unprocessedData = ''
	}

	private _setConnected(connected: boolean) {
		if (connected) {
			// Reset the last message sent time when connection is established
			this._lastMessageSentTime = 0

			if (!this._keepaliveTimer) {
				this._keepaliveTimer = setInterval(() => this._sendKeepalive(), KEEPALIVE_INTERVAL)
			}

			if (!this._connected) {
				this._connected = true
				this.emit('connect')
			}
		} else {
			if (this._keepaliveTimer) {
				clearInterval(this._keepaliveTimer)
				this._keepaliveTimer = undefined
			}

			if (this._connected) {
				this._connected = false
				this.emit('disconnect')
			}
		}
	}

	private _sendKeepalive(): void {
		// Only send keepalive if no message has been sent within KEEPALIVE_INTERVAL/2
		const timeSinceLastMessage = Date.now() - this._lastMessageSentTime
		if (timeSinceLastMessage < KEEPALIVE_INTERVAL / 2) {
			return
		}

		// Fire and forget, it won't respond
		this._socket?.write('\r\n')

		// TODO: we don't get a response to this, should this be a query so that we can check the connection is still responding?
	}
}
