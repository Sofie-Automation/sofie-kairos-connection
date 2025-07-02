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

	describe('subscribeValue', () => {
		beforeEach(() => {
			connection = new MinimalKairosConnection({ autoConnect: false })
		})

		test('should create subscription and query initial value', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start subscription
			connection.subscribeValue(path, abortController.signal, callback, true)

			// Process the queue to send commands
			await vi.runOnlyPendingTimersAsync()

			// Should send subscribe command and query command
			expect(mockConnection.sendCommand).toHaveBeenCalledWith(`subscribe:${path}`)
			expect(mockConnection.sendCommand).toHaveBeenCalledWith(path)
			expect(mockConnection.sendCommand).toHaveBeenCalledTimes(2)

			// Simulate receiving subscribe OK and query response
			mockConnection.emit('lines', ['OK'])
			mockConnection.emit('lines', [`${path}=IP1`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Callback should be called with the initial value
			expect(callback).toHaveBeenCalledWith(path, null, 'IP1')
			expect(callback).toHaveBeenCalledTimes(1)
		})

		test('should create subscription without querying initial value when fetchCurrentValue is false', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start subscription without fetching current value
			connection.subscribeValue(path, abortController.signal, callback, false)

			// Process the queue to send commands
			await vi.runOnlyPendingTimersAsync()

			// Should only send subscribe command, not query
			expect(mockConnection.sendCommand).toHaveBeenCalledWith(`subscribe:${path}`)
			expect(mockConnection.sendCommand).toHaveBeenCalledTimes(1)

			// Simulate receiving subscribe OK
			mockConnection.emit('lines', ['OK'])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Callback should not be called yet
			expect(callback).not.toHaveBeenCalled()
		})

		test('should reuse existing subscription and return cached value', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController1 = new AbortController()
			const abortController2 = new AbortController()
			const callback1 = vi.fn()
			const callback2 = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start first subscription
			connection.subscribeValue(path, abortController1.signal, callback1)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK and query response
			mockConnection.emit('lines', ['OK'])
			mockConnection.emit('lines', [`${path}=IP1`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Clear mock calls for clarity
			vi.clearAllMocks()

			// Start second subscription to same path
			connection.subscribeValue(path, abortController2.signal, callback2)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Should not send new subscribe command since subscription already exists
			expect(mockConnection.sendCommand).not.toHaveBeenCalled()

			// Second callback should be called immediately with cached value
			expect(callback2).toHaveBeenCalledWith(path, null, 'IP1')
			expect(callback2).toHaveBeenCalledTimes(1)
		})

		test('should notify all subscribers of value updates', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController1 = new AbortController()
			const abortController2 = new AbortController()
			const callback1 = vi.fn()
			const callback2 = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start first subscription
			connection.subscribeValue(path, abortController1.signal, callback1)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK and initial query response
			mockConnection.emit('lines', ['OK'])
			mockConnection.emit('lines', [`${path}=IP1`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Now start second subscription - it should reuse the subscription and get cached value
			connection.subscribeValue(path, abortController2.signal, callback2)

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Second subscriber should get cached value immediately
			expect(callback2).toHaveBeenCalledWith(path, null, 'IP1')

			// Should have sent: subscribe, query (2 commands total)
			expect(mockConnection.sendCommand).toHaveBeenCalledWith(`subscribe:${path}`)
			expect(mockConnection.sendCommand).toHaveBeenCalledWith(path)
			expect(mockConnection.sendCommand).toHaveBeenCalledTimes(2)

			// Clear calls for clarity
			callback1.mockClear()
			callback2.mockClear()

			// Simulate receiving subscription value update
			mockConnection.emit('lines', [`${path}=IP2`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Both callbacks should be called with new value
			expect(callback1).toHaveBeenCalledWith(path, null, 'IP2')
			expect(callback2).toHaveBeenCalledWith(path, null, 'IP2')
		})

		test('should unsubscribe when last subscriber aborts', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start subscription
			connection.subscribeValue(path, abortController.signal, callback)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK
			mockConnection.emit('lines', ['OK'])

			// Clear mock calls for clarity
			vi.clearAllMocks()

			// Abort the subscription
			abortController.abort()

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Should send unsubscribe command
			expect(mockConnection.sendCommand).toHaveBeenCalledWith(`unsubscribe:${path}`)
			expect(mockConnection.sendCommand).toHaveBeenCalledTimes(1)
		})

		test('should not unsubscribe when one of multiple subscribers aborts', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController1 = new AbortController()
			const abortController2 = new AbortController()
			const callback1 = vi.fn()
			const callback2 = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start first subscription
			connection.subscribeValue(path, abortController1.signal, callback1)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK and initial query response
			mockConnection.emit('lines', ['OK'])
			mockConnection.emit('lines', [`${path}=IP1`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Start second subscription - should get cached value
			connection.subscribeValue(path, abortController2.signal, callback2)

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Clear mock calls for clarity
			vi.clearAllMocks()

			// Abort only the first subscription
			abortController1.abort()

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Should not send unsubscribe command since there's still one subscriber
			expect(mockConnection.sendCommand).not.toHaveBeenCalled()

			// Simulate receiving subscription value update
			mockConnection.emit('lines', [`${path}=IP2`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Only second callback should be called (first was aborted)
			expect(callback1).not.toHaveBeenCalled()
			expect(callback2).toHaveBeenCalledWith(path, null, 'IP2')
		})

		test('should handle subscription command failure', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start subscription
			connection.subscribeValue(path, abortController.signal, callback)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving error response to subscribe command
			mockConnection.emit('lines', [`Error:Subscribe failed`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Callback should be called with error
			expect(callback).toHaveBeenCalledWith(path, expect.any(Error), null)
			const callArgs = callback.mock.calls[0]
			expect(callArgs[1].message).toContain('Subscribe failed')
		})

		test('should handle query command failure', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start subscription
			connection.subscribeValue(path, abortController.signal, callback)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK, and failed query
			mockConnection.emit('lines', ['OK'])
			mockConnection.emit('lines', [`Error`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Callback should be called with error
			expect(callback).toHaveBeenCalledWith(path, expect.any(Error), null)
			const callArgs = callback.mock.calls[0]
			expect(callArgs[1].message).toContain('Error response received')
		})

		test('should terminate all subscriptions on disconnect', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController1 = new AbortController()
			const abortController2 = new AbortController()
			const callback1 = vi.fn()
			const callback2 = vi.fn()
			const path1 = 'SCENES.Main.Layers.PGM.source_pgm'
			const path2 = 'SCENES.Main.Layers.PST.source_pst'

			// Start subscriptions on different paths
			connection.subscribeValue(path1, abortController1.signal, callback1)
			connection.subscribeValue(path2, abortController2.signal, callback2)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK for both
			mockConnection.emit('lines', ['OK', `${path1}=1`])
			mockConnection.emit('lines', ['OK', `${path2}=2`])

			// Process initial commands
			await vi.runOnlyPendingTimersAsync()

			// Clear mock calls
			callback1.mockClear()
			callback2.mockClear()

			// Simulate disconnect
			mockConnection.emit('disconnect')

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Both callbacks should be called with TerminateSubscriptionError
			expect(callback1).toHaveBeenCalledWith(path1, expect.any(Error), null)
			expect(callback2).toHaveBeenCalledWith(path2, expect.any(Error), null)

			const error1 = callback1.mock.calls[0][1]
			const error2 = callback2.mock.calls[0][1]
			expect(error1.name).toBe('TerminateSubscriptionError')
			expect(error1.message).toContain('Disconnected from KAIROS')
			expect(error2.name).toBe('TerminateSubscriptionError')
			expect(error2.message).toContain('Disconnected from KAIROS')
		})

		test('should terminate all subscriptions on application reset', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start subscription
			connection.subscribeValue(path, abortController.signal, callback)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK
			mockConnection.emit('lines', ['OK'])

			// Clear mock calls
			callback.mockClear()

			// Simulate application reset
			mockConnection.emit('lines', ['APPLICATION:Reset'])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Callback should be called with TerminateSubscriptionError
			expect(callback).toHaveBeenCalledWith(path, expect.any(Error), null)

			const error = callback.mock.calls[0][1]
			expect(error.name).toBe('TerminateSubscriptionError')
			expect(error.message).toContain('Application reset')
		})

		test('should not call callback after abort signal is triggered', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start subscription
			connection.subscribeValue(path, abortController.signal, callback)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK and initial query response
			mockConnection.emit('lines', ['OK'])
			mockConnection.emit('lines', [`${path}=IP1`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Clear calls
			callback.mockClear()

			// Abort the subscription
			abortController.abort()

			// Simulate receiving subscription value update after abort
			mockConnection.emit('lines', [`${path}=IP2`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Callback should not be called since it was aborted
			expect(callback).not.toHaveBeenCalled()
		})

		test('should reject subscription when not connected', () => {
			// Don't emit connect event
			const abortController = new AbortController()
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Should throw error when not connected
			expect(() => {
				connection.subscribeValue(path, abortController.signal, callback)
			}).toThrow('Cannot send commands, not connected to KAIROS')
		})

		test('should reject subscription when abort signal is already aborted', () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			abortController.abort() // Abort before subscribing
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Should throw error when abort signal is already aborted
			expect(() => {
				connection.subscribeValue(path, abortController.signal, callback)
			}).toThrow('Cannot subscribe, abort signal is already aborted')
		})

		test('should not call callback after subscription receives error', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Start subscription
			connection.subscribeValue(path, abortController.signal, callback)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK and initial query response
			mockConnection.emit('lines', ['OK'])
			mockConnection.emit('lines', [`${path}=IP1`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Clear calls
			callback.mockClear()

			// Now send another getAttribute to create a pending command, then send error
			const errorPromise = connection.getAttribute('another.path').catch(() => null) // Catch to prevent unhandled rejection

			// Process to send the command
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving error response (which will be attributed to the getAttribute command)
			mockConnection.emit('lines', [`Error`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// The error should be for the getAttribute command, not the subscription
			await expect(errorPromise).resolves.toBeNull() // The catch should have caught the error

			// Now simulate receiving subscription value update
			mockConnection.emit('lines', [`${path}=IP2`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Subscription callback should still work since it wasn't the one that failed
			expect(callback).toHaveBeenCalledWith(path, null, 'IP2')
		})

		test('should handle callback throwing error gracefully', async () => {
			mockConnection.sendCommand.mockResolvedValue(undefined)
			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			const callback = vi.fn(() => {
				throw new Error('Callback error')
			})
			const errorSpy = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'

			// Listen for error events
			connection.on('error', errorSpy)

			// Start subscription
			connection.subscribeValue(path, abortController.signal, callback)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK and initial query response
			mockConnection.emit('lines', ['OK'])
			mockConnection.emit('lines', [`${path}=IP1`])

			// Process async callbacks
			await vi.runOnlyPendingTimersAsync()

			// Callback should be called
			expect(callback).toHaveBeenCalledWith(path, null, 'IP1')

			// Error event should be emitted for the callback error
			expect(errorSpy).toHaveBeenCalledWith(expect.any(Error))
			const emittedError = errorSpy.mock.calls[0][0]
			expect(emittedError.message).toBe('Callback error')
		})

		test('should handle unsubscribe command failure gracefully', async () => {
			mockConnection.sendCommand
				.mockResolvedValueOnce(undefined) // subscribe command succeeds
				.mockResolvedValueOnce(undefined) // query command succeeds
				.mockResolvedValueOnce(new Error('Unsubscribe failed')) // unsubscribe command fails

			mockConnection.emit('connect') // Simulate connection

			const abortController = new AbortController()
			const callback = vi.fn()
			const path = 'SCENES.Main.Layers.PGM.source_pgm'
			const warnSpy = vi.fn()

			// Listen for warn events
			connection.on('warn', warnSpy)

			// Start subscription
			connection.subscribeValue(path, abortController.signal, callback)

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Simulate receiving subscribe OK
			mockConnection.emit('lines', ['OK'])

			// Abort the subscription to trigger unsubscribe
			abortController.abort()

			// Process the queue
			await vi.runOnlyPendingTimersAsync()

			// Warn event should be emitted for the unsubscribe failure
			expect(warnSpy).toHaveBeenCalledWith(expect.any(Error))
			const warnError = warnSpy.mock.calls[0][0]
			expect(warnError.message).toContain('Unsubscribe failed')
		})
	})
})
