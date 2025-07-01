import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest'
import { MinimalKairosConnection, Options } from '../kairos-minimal.js'

// Mock the Connection class
vi.mock(import('../connection.js'), async (original) => {
	return {
		...(await original()),
		Connection: MockConnection as any,
	}
})

const MockConnection = vi.hoisted(() => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { EventEmitter } = require('node:events') as typeof import('node:events')

	const connections: Array<MockConnectionInstance> = []
	const onNextConnection: Array<(connection: MockConnectionInstance) => void> = []

	class MockConnectionInstance extends EventEmitter {
		public connected = false
		public host: string
		public port: number
		public sendCommand = vi.fn()
		public changeConnection = vi.fn()
		public disconnect = vi.fn()

		constructor(host: string, port: number, autoConnect: boolean) {
			super()

			this.host = host
			this.port = port

			const cb = onNextConnection.shift()
			if (cb) {
				cb(this)
			}

			connections.push(this)

			if (autoConnect) {
				// Simulate auto-connect behavior
				setTimeout(() => {
					this.connected = true
					this.emit('connect')
				}, 0)
			}
		}

		public static mockConnections(): MockConnectionInstance[] {
			return connections
		}

		public static mockOnNextConnection(cb: (connection: MockConnectionInstance) => void): void {
			onNextConnection.push(cb)
		}

		public static clearMockOnNextConnection(): void {
			onNextConnection.splice(0, 99999)
		}

		public static clearMockConnections(): void {
			connections.splice(0, connections.length)
		}
	}

	return MockConnectionInstance
})

describe('MinimalKairosConnection', () => {
	let connection: MinimalKairosConnection
	let mockConnection: InstanceType<typeof MockConnection>

	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()

		// Clear any existing connections and callbacks
		MockConnection.clearMockOnNextConnection()
		MockConnection.clearMockConnections()

		// Set up the next connection to be created
		MockConnection.mockOnNextConnection((conn) => {
			mockConnection = conn
		})
	})

	afterEach(() => {
		if (connection) {
			connection.discard()
		}
		vi.clearAllTimers()
		vi.useRealTimers()
		MockConnection.clearMockOnNextConnection()
	})

	describe('constructor', () => {
		test('should create with custom options', () => {
			const options: Options = {
				host: '192.168.1.100',
				port: 4000,
				timeoutTime: 10000,
				autoConnect: false,
			}

			connection = new MinimalKairosConnection(options)

			expect(connection.host).toBe('192.168.1.100')
			expect(connection.port).toBe(4000)
		})

		test('should handle constructor with autoConnect true', () => {
			// Create a new connection with autoConnect enabled
			connection = new MinimalKairosConnection({ autoConnect: true })

			// The MockConnection constructor should have been called with autoConnect = true
			const connections = MockConnection.mockConnections()
			const lastConnection = connections[connections.length - 1]

			// Verify the connection was created with the right parameters
			expect(connection.host).toBe('127.0.0.1')
			expect(connection.port).toBe(3005)
			expect(lastConnection.host).toBe('127.0.0.1')
			expect(lastConnection.port).toBe(3005)
		})

		test('should handle constructor with autoConnect false', () => {
			// This is already tested in beforeEach, but let's be explicit
			connection = new MinimalKairosConnection({ autoConnect: false })

			// The MockConnection constructor should have been called with autoConnect = false
			const connections = MockConnection.mockConnections()
			const lastConnection = connections[connections.length - 1]

			// Verify the connection was created with the right parameters
			expect(lastConnection.host).toBe('127.0.0.1')
			expect(lastConnection.port).toBe(3005)
		})
	})

	describe('connection management', () => {
		beforeEach(() => {
			connection = new MinimalKairosConnection({ autoConnect: false })
		})

		test('should connect with new host and port', () => {
			connection.connect('192.168.1.200', 5000)

			expect(connection.host).toBe('192.168.1.200')
			expect(connection.port).toBe(5000)
			expect(mockConnection.changeConnection).toHaveBeenCalledWith('192.168.1.200', 5000)
		})

		test('should connect with existing host and port if not specified', () => {
			connection.connect()
			// Should keep existing values
			expect(connection.host).toBe('127.0.0.1')
			expect(connection.port).toBe(3005)
			expect(mockConnection.changeConnection).toHaveBeenCalledWith('127.0.0.1', 3005)
		})

		test('should connect with only host specified', () => {
			connection.connect('10.0.0.1')

			expect(connection.host).toBe('10.0.0.1')
			expect(connection.port).toBe(3005) // Should keep existing port
			expect(mockConnection.changeConnection).toHaveBeenCalledWith('10.0.0.1', 3005)
		})

		test('should connect with only port specified', () => {
			connection.connect(undefined, 4000)

			expect(connection.host).toBe('127.0.0.1') // Should keep existing host
			expect(connection.port).toBe(4000)
			expect(mockConnection.changeConnection).toHaveBeenCalledWith('127.0.0.1', 4000)
		})

		test('should return connected status from internal connection', () => {
			// Initially not connected
			expect(connection.connected).toBe(false)
			expect(connection.connected).toBe(mockConnection.connected)

			// Simulate connection
			mockConnection.connected = true
			expect(connection.connected).toBe(true)
		})

		test('should disconnect and discard pending requests', async () => {
			// First, set up some pending requests
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate

			// Add a processed request (sent but waiting for response)
			const processedRequest = connection.setAttribute('test.path', 'value')
			await vi.runOnlyPendingTimersAsync()

			// Now disconnect immediately before the second request gets queued
			connection.disconnect()

			// Add an request after disconnecting - don't await pending timers for this one
			const unprocessedRequest = connection.getAttribute('another.path')

			// Verify the internal connection disconnect was called
			expect(mockConnection.disconnect).toHaveBeenCalled()

			await expect(processedRequest).rejects.toMatchObject(/Disconnected/)
			await expect(unprocessedRequest).rejects.toMatchObject(/Disconnected/)
		})

		test('should update host and port properties when connecting', () => {
			// Initial values
			expect(connection.host).toBe('127.0.0.1')
			expect(connection.port).toBe(3005)

			// Connect with new values
			connection.connect('192.168.1.100', 8080)

			// Properties should be updated
			expect(connection.host).toBe('192.168.1.100')
			expect(connection.port).toBe(8080)

			// Internal connection should be called with new values
			expect(mockConnection.changeConnection).toHaveBeenCalledWith('192.168.1.100', 8080)
		})
	})

	describe('events', () => {
		beforeEach(() => {
			connection = new MinimalKairosConnection({ autoConnect: false })
		})

		test('should emit reset event when APPLICATION line is received', async () => {
			const resetSpy = vi.fn()
			connection.on('reset', resetSpy)

			// Simulate lines using the tracked mock connection
			mockConnection.emit('lines', ['APPLICATION: new'])

			// Use runOnlyPendingTimers to avoid infinite loop with setInterval
			await vi.runOnlyPendingTimersAsync()
			expect(resetSpy).toHaveBeenCalled()
		})

		test('should emit connect event when internal connection connects', async () => {
			const connectSpy = vi.fn()
			connection.on('connect', connectSpy)

			// Simulate connect event using the tracked mock connection
			mockConnection.emit('connect')

			await vi.runOnlyPendingTimersAsync()
			expect(connectSpy).toHaveBeenCalled()
		})

		test('should emit disconnect event when internal connection disconnects', async () => {
			const disconnectSpy = vi.fn()
			connection.on('disconnect', disconnectSpy)

			// Simulate disconnect event using the tracked mock connection
			mockConnection.emit('disconnect')

			await vi.runOnlyPendingTimersAsync()
			expect(disconnectSpy).toHaveBeenCalled()
		})

		test('should emit error event when internal connection has error', async () => {
			const errorSpy = vi.fn()
			connection.on('error', errorSpy)

			const testError = new Error('Connection error')
			// Simulate error event using the tracked mock connection
			mockConnection.emit('error', testError)

			await vi.runOnlyPendingTimersAsync()
			expect(errorSpy).toHaveBeenCalledWith(testError)
		})
	})

	describe('command execution', () => {
		beforeEach(() => {
			connection = new MinimalKairosConnection({ autoConnect: false })
		})

		test('should execute setAttribute command and send correct message', async () => {
			// Mock the tracked connection's sendCommand
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			// Execute the command (this will not resolve until we send a response)
			const promise = connection.setAttribute('SCENES.Main.Layers.PGM.source_pgm', 'IP1')

			// Process the queue to send the command
			await vi.runOnlyPendingTimersAsync()

			// Verify the correct serialized command was sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('SCENES.Main.Layers.PGM.source_pgm=IP1')

			// Simulate receiving an "OK" response from the connection
			mockConnection.emit('lines', ['OK'])

			// Now the promise should resolve
			await expect(promise).resolves.toBeUndefined()
		})

		test('should execute getAttribute command and send correct message', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			// Execute the command (this will not resolve until we send a response)
			const promise = connection.getAttribute('SCENES.Main.Layers.PGM.source_pgm')

			// Process the queue to send the command
			await vi.runOnlyPendingTimersAsync()

			// Verify the correct serialized command was sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('SCENES.Main.Layers.PGM.source_pgm')

			// Simulate receiving a response from the connection
			mockConnection.emit('lines', ['SCENES.Main.Layers.PGM.source_pgm=IP1'])

			// Now the promise should resolve with the value
			await expect(promise).resolves.toBe('IP1')
		})

		test('should execute getList command and send correct message', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			// Execute the command (this will not resolve until we send a response)
			const promise = connection.getList('SCENES.Main.Layers.PGM.sources')

			// Process the queue to send the command
			await vi.runOnlyPendingTimersAsync()

			// Verify the correct serialized command was sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('list_ex:SCENES.Main.Layers.PGM.sources')

			// Simulate receiving a list response from the connection
			mockConnection.emit('lines', ['list_ex:SCENES.Main.Layers.PGM.sources=', 'IP1', 'IP2', 'IP3', ''])

			// Now the promise should resolve with the list
			await expect(promise).resolves.toEqual(['IP1', 'IP2', 'IP3'])
		})

		test('should execute multiple commands in sequence with correct serialization', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			// Execute the commands (they will not resolve until we send responses)
			const promise1 = connection.setAttribute('path1', 'value1')
			const promise2 = connection.getAttribute('path2')
			const promise3 = connection.getList('path3')

			// Process the queue to send the commands
			await vi.runOnlyPendingTimersAsync()

			// Verify all commands were sent with correct serialization
			expect(mockConnection.sendCommand).toHaveBeenNthCalledWith(1, 'path1=value1')
			expect(mockConnection.sendCommand).toHaveBeenNthCalledWith(2, 'path2')
			expect(mockConnection.sendCommand).toHaveBeenNthCalledWith(3, 'list_ex:path3')
			expect(mockConnection.sendCommand).toHaveBeenCalledTimes(3)

			// Simulate receiving responses from the connection
			mockConnection.emit('lines', ['OK'])
			mockConnection.emit('lines', ['path2=test_value'])
			mockConnection.emit('lines', ['list_ex:path3=', 'item1', 'item2', ''])

			// Now all promises should resolve
			await expect(promise1).resolves.toBeUndefined()
			await expect(promise2).resolves.toBe('test_value')
			await expect(promise3).resolves.toEqual(['item1', 'item2'])
		})

		test('should return error when sendCommand fails', async () => {
			const testError = new Error('Send failed')
			mockConnection.sendCommand.mockResolvedValue(testError)
			mockConnection.emit('connect') // Simulate connection

			// The promise should reject when sendCommand fails
			const promise = connection.setAttribute('test.path', 'value')
			promise.catch(() => null) // Prevent unhandled rejection warning

			// Process the queue to send the command
			await vi.runOnlyPendingTimersAsync()

			// Verify the command was still attempted to be sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('test.path=value')

			// The promise should reject with the error
			await expect(promise).rejects.toEqual(testError)
		})
	})

	describe('response processing', () => {
		beforeEach(() => {
			connection = new MinimalKairosConnection({ autoConnect: false })
		})

		test('should handle error response', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			// Execute a command (this will not resolve until we send a response)
			const promise = connection.getAttribute('test.path')

			// Process the queue to send the command
			await vi.runOnlyPendingTimersAsync()

			// Simulate error response
			mockConnection.emit('lines', ['My Real Error'])

			// The request should be rejected with an error
			await expect(promise).rejects.toThrow('Error response received: My Real Error')
		})

		test('should handle unexpected lines when no command is in flight', async () => {
			const errorSpy = vi.fn()
			connection.on('error', errorSpy)

			// Simulate unexpected line
			mockConnection.emit('lines', ['unexpected_line'])

			await vi.runOnlyPendingTimersAsync()
			expect(errorSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Unexpected line received (no command is pending): unexpected_line',
				})
			)
		})
	})

	describe('timeout handling', () => {
		beforeEach(() => {
			connection = new MinimalKairosConnection({
				autoConnect: false,
				timeoutTime: 1000,
			})
		})

		test('should timeout requests that take too long', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			// Execute a command (this will not resolve until we send a response)
			const promise = connection.setAttribute('test.path', 'value')
			promise.catch(() => null) // Prevent unhandled rejection warning

			// Process the queue to send the command
			await vi.runOnlyPendingTimersAsync()

			// Advance time past timeout without sending a response
			vi.advanceTimersByTime(2000)
			await vi.runOnlyPendingTimersAsync()

			// The request should be rejected with timeout error
			await expect(promise).rejects.toThrow('Time out')
		})
	})

	describe('discard', () => {
		test('should clean up resources when discarded', () => {
			connection = new MinimalKairosConnection({ autoConnect: false })

			connection.discard()

			expect(mockConnection.disconnect).toHaveBeenCalled()
		})
	})
})
