/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest'
import { MinimalKairosConnection, Options } from '../kairos-minimal.js'
import { Commands } from '../commands.js'

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

			// Verify that the processed request was rejected with disconnect error
			const processedResult = await processedRequest
			if (processedResult.error) {
				// If sendCommand returned an error, check that
				expect(processedResult.error.message).toContain('Disconnected')
				expect(processedResult.request).toBeUndefined()
			} else {
				// If it was processed successfully, the request promise should reject
				await expect(processedResult.request).rejects.toThrow('Disconnected before response was received')
			}

			// Verify that the unprocessed request was rejected with disconnect error
			await expect(unprocessedRequest).rejects.toMatchObject(/Cannot send commands/)
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
			mockConnection.emit('connect') // Simulate

			const result = await connection.setAttribute('SCENES.Main.Layers.PGM.source_pgm', 'IP1')

			expect(result.error).toBeUndefined()
			expect(result.request).toBeInstanceOf(Promise)

			// Verify the correct serialized command was sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('SCENES.Main.Layers.PGM.source_pgm=IP1')
		})

		test('should execute getAttribute command and send correct message', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate

			const result = await connection.getAttribute('SCENES.Main.Layers.PGM.source_pgm')

			expect(result.error).toBeUndefined()
			expect(result.request).toBeInstanceOf(Promise)

			// Verify the correct serialized command was sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('SCENES.Main.Layers.PGM.source_pgm')
		})

		test('should execute getList command and send correct message', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate

			const result = await connection.getList('SCENES.Main.Layers.PGM.sources')

			expect(result.error).toBeUndefined()
			expect(result.request).toBeInstanceOf(Promise)

			// Verify the correct serialized command was sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('list_ex:SCENES.Main.Layers.PGM.sources')
		})

		test('should execute subscribe command via executeCommand', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate

			const result = await connection.executeCommand({
				command: Commands.SubscribeValue,
				params: { path: 'SCENES.Main.Layers.PGM.source_pgm' },
			})

			expect(result.error).toBeUndefined()
			expect(result.request).toBeInstanceOf(Promise)

			// Verify the correct serialized command was sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('subscribe:SCENES.Main.Layers.PGM.source_pgm')
		})

		test('should execute unsubscribe command via executeCommand', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate

			const result = await connection.executeCommand({
				command: Commands.UnsubscribeValue,
				params: { path: 'SCENES.Main.Layers.PGM.source_pgm' },
			})

			expect(result.error).toBeUndefined()
			expect(result.request).toBeInstanceOf(Promise)

			// Verify the correct serialized command was sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('unsubscribe:SCENES.Main.Layers.PGM.source_pgm')
		})

		test('should execute custom command with proper serialization', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate

			const result = await connection.executeCommand({
				command: Commands.SetValue,
				params: { path: 'custom.path', value: 'custom_value' },
			})

			expect(result.error).toBeUndefined()
			expect(result.request).toBeInstanceOf(Promise)

			// Verify the correct serialized command was sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('custom.path=custom_value')
		})

		test('should execute multiple commands in sequence with correct serialization', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate

			const result1 = await connection.setAttribute('path1', 'value1')
			const result2 = await connection.getAttribute('path2')
			const result3 = await connection.getList('path3')

			expect(result1.error).toBeUndefined()
			expect(result2.error).toBeUndefined()
			expect(result3.error).toBeUndefined()

			await vi.runOnlyPendingTimersAsync()

			// Verify all commands were sent with correct serialization
			expect(mockConnection.sendCommand).toHaveBeenNthCalledWith(1, 'path1=value1')
			expect(mockConnection.sendCommand).toHaveBeenNthCalledWith(2, 'path2')
			expect(mockConnection.sendCommand).toHaveBeenNthCalledWith(3, 'list_ex:path3')
			expect(mockConnection.sendCommand).toHaveBeenCalledTimes(3)
		})

		test('should return error when sendCommand fails', async () => {
			const testError = new Error('Send failed')
			mockConnection.sendCommand.mockResolvedValue(testError)
			mockConnection.emit('connect') // Simulate

			const result = await connection.setAttribute('test.path', 'value')

			expect(result.error).toEqual(testError)
			expect(result.request).toBeUndefined()

			// Verify the command was still attempted to be sent
			expect(mockConnection.sendCommand).toHaveBeenCalledWith('test.path=value')
		})

		test('should handle serialization errors', async () => {
			mockConnection.emit('connect') // Simulate

			const result = await connection.executeCommand({
				command: Commands.SetValue,
				params: undefined as any, // Invalid params to trigger serialization error
			})

			expect(result.error).toBeInstanceOf(Error)
			expect(result.request).toBeUndefined()

			// Verify sendCommand was not called due to serialization error
			expect(mockConnection.sendCommand).not.toHaveBeenCalled()
		})

		test('should handle missing command in executeCommand', async () => {
			mockConnection.emit('connect') // Simulate

			const result = await connection.executeCommand({
				command: undefined as any,
				params: { path: 'test', value: 'test' },
			})

			expect(result.error).toBeInstanceOf(Error)
			expect(result.error?.message).toContain('No command specified')
			expect(result.request).toBeUndefined()

			// Verify sendCommand was not called due to missing command
			expect(mockConnection.sendCommand).not.toHaveBeenCalled()
		})
	})

	describe('response processing', () => {
		beforeEach(() => {
			connection = new MinimalKairosConnection({ autoConnect: false })
		})

		test('should handle error response', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate

			// Execute a command
			const result = await connection.getAttribute('test.path')
			expect(result.error).toBeUndefined()

			// Simulate error response
			await vi.runOnlyPendingTimersAsync()
			mockConnection.emit('lines', ['Error: Command failed'])

			await vi.runOnlyPendingTimersAsync()

			// The request should be rejected with an error
			await expect(result.request).rejects.toThrow('Error response received: Error: Command failed')
		})

		test('should handle unexpected lines when no command is in flight', async () => {
			const errorSpy = vi.fn()
			connection.on('error', errorSpy)

			// Simulate unexpected line
			mockConnection.emit('lines', ['unexpected_line'])

			await vi.runOnlyPendingTimersAsync()
			expect(errorSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Unknown line received: unexpected_line',
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
			mockConnection.emit('connect') // Simulate

			// Execute a command
			const result = await connection.setAttribute('test.path', 'value')
			expect(result.error).toBeUndefined()

			const responsePromise = result.request!
			responsePromise.catch(() => null) // Prevent unhandled promise rejection

			// Advance time past timeout
			await vi.runOnlyPendingTimersAsync()
			vi.advanceTimersByTime(2000)
			await vi.runOnlyPendingTimersAsync()

			// The request should be rejected with timeout error
			await expect(responsePromise).rejects.toThrow('Time out')
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
