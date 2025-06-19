/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest'
import { Socket } from '../__mocks__/net.js'
import { Connection } from '../connection.js'

// Use the existing mock
vi.mock('node:net', async () => import('../__mocks__/net.js'))

describe('Connection', () => {
	let mockSocket: Socket
	let connection: Connection

	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()

		// Clear any existing sockets and callbacks
		Socket.clearMockOnNextSocket()
		// Clear the socket array
		const sockets = Socket.mockSockets()
		sockets.splice(0, sockets.length)

		// Set up the next socket to be created
		Socket.mockOnNextSocket((socket) => {
			mockSocket = socket
		})
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.clearAllMocks()
		Socket.clearMockOnNextSocket()
	})

	describe('constructor', () => {
		test('should create connection without auto-connect', () => {
			connection = new Connection('localhost', 3005, false)

			expect(connection).toBeInstanceOf(Connection)
			expect(connection.connected).toBe(false)
			expect(Socket.mockSockets()).toHaveLength(0)
		})

		test('should create connection with auto-connect', () => {
			connection = new Connection('localhost', 3005, true)

			expect(connection).toBeInstanceOf(Connection)
			expect(Socket.mockSockets()).toHaveLength(1)
			expect(mockSocket).toBeDefined()
		})

		test('should use default port when not specified', async () => {
			let socketConnected = false
			let connectPort: number | undefined
			let connectHost: string | undefined

			// Clear the beforeEach callback and set up our own
			Socket.clearMockOnNextSocket()
			Socket.mockOnNextSocket((socket) => {
				mockSocket = socket
				socket.onConnect = (port, host) => {
					socketConnected = true
					connectPort = port
					connectHost = host
				}
			})

			connection = new Connection('localhost', undefined, true)

			expect(mockSocket).toBeTruthy()
			expect(socketConnected).toBe(true)
			expect(connectPort).toBe(3005)
			expect(connectHost).toBe('localhost')
		})
	})

	describe('connection management', () => {
		beforeEach(() => {
			connection = new Connection('localhost', 3005, false)
		})

		test('should handle successful connection', async () => {
			const connectSpy = vi.fn()
			connection.on('connect', connectSpy)

			// Use public API to trigger connection
			connection.changeConnection('localhost', 3005)

			// Wait for the asynchronous connection to complete
			await vi.waitFor(() => {
				expect(connection.connected).toBe(true)
			})
			expect(connectSpy).toHaveBeenCalledOnce()
		})

		test('should handle disconnection', async () => {
			const disconnectSpy = vi.fn()
			connection.on('disconnect', disconnectSpy)

			// Use public API to connect first
			connection.changeConnection('localhost', 3005)

			// Wait for connection to be established
			await vi.waitFor(() => {
				expect(connection.connected).toBe(true)
			})

			// Then disconnect
			mockSocket.mockClose()

			expect(connection.connected).toBe(false)
			expect(disconnectSpy).toHaveBeenCalledOnce()
		})

		test('should trigger reconnect after disconnection', () => {
			// Use public API to connect first
			connection.changeConnection('localhost', 3005)

			// Simulate disconnect
			mockSocket.mockClose()

			// Set up next socket for reconnection
			let reconnectedSocket: Socket
			Socket.mockOnNextSocket((socket) => {
				reconnectedSocket = socket
			})

			// Advance timers to trigger reconnect
			vi.advanceTimersByTime(5000)

			expect(reconnectedSocket!).toBeDefined()
		})

		test('should change connection parameters', () => {
			connection = new Connection('localhost', 3005, true)
			const firstSocket = mockSocket

			let newSocket: Socket
			Socket.mockOnNextSocket((socket) => {
				newSocket = socket
			})

			connection.changeConnection('newhost', 4000)

			expect(newSocket!).toBeDefined()
			expect(newSocket! !== firstSocket).toBe(true)
		})

		test('should disconnect properly', async () => {
			connection = new Connection('localhost', 3005, true)

			// Connection is already established via auto-connect
			await vi.waitFor(() => {
				expect(connection.connected).toBe(true)
			})

			const endSpy = vi.spyOn(mockSocket, 'end')
			connection.disconnect()

			expect(endSpy).toHaveBeenCalled()
		})
	})

	describe('data processing', () => {
		beforeEach(() => {
			connection = new Connection('localhost', 3005, true)
		})

		test('should process single line of data', () => {
			const linesSpy = vi.fn()
			connection.on('lines', linesSpy)

			mockSocket.mockData(Buffer.from('OK\r\n'))

			expect(linesSpy).toHaveBeenCalledWith(['OK'])
		})

		test('should process multiple lines of data', () => {
			const linesSpy = vi.fn()
			connection.on('lines', linesSpy)

			mockSocket.mockData(Buffer.from('OK\r\nINFO Test\r\n'))

			expect(linesSpy).toHaveBeenCalledWith(['OK', 'INFO Test'])
		})

		test('should handle fragmented data', () => {
			const linesSpy = vi.fn()
			connection.on('lines', linesSpy)

			// Send first fragment
			mockSocket.mockData(Buffer.from('OK\r\nINFO Partial'))
			expect(linesSpy).toHaveBeenCalledWith(['OK'])

			// Send second fragment
			mockSocket.mockData(Buffer.from(' Message\r\n'))
			expect(linesSpy).toHaveBeenCalledWith(['INFO Partial Message'])
		})

		test('should handle data processing errors', () => {
			const errorSpy = vi.fn()
			connection.on('error', errorSpy)

			// Force an error by calling mockData with invalid data that will cause processing to fail
			// The connection should catch the error and emit it
			mockSocket.mockData(Buffer.from('test\r\n'))

			// Manually trigger the error by overriding the data handler after the connection is set up
			const connection_: any = connection
			const originalProcessData = connection_._processIncomingData
			connection_._processIncomingData = () => {
				throw new Error('Processing error')
			}

			mockSocket.mockData(Buffer.from('test\r\n'))

			expect(errorSpy).toHaveBeenCalledWith(expect.any(Error))

			// Restore original handler
			connection_._processIncomingData = originalProcessData
		})
	})

	describe('command sending', () => {
		beforeEach(() => {
			connection = new Connection('localhost', 3005, true)
		})

		test('should send command successfully', async () => {
			mockSocket.onWrite = vi.fn()

			const result = await connection.sendCommand('QUERY test.parameter')

			expect(mockSocket.onWrite).toHaveBeenCalledWith('QUERY test.parameter\r\n', 'utf-8')
			expect(result).toBeUndefined()
		})

		test('should handle send command error', async () => {
			// Mock write to simulate an error
			const testError = new Error('Write error')

			// Override the write method to call callback with error
			mockSocket.write = vi.fn().mockImplementation((_buf: Buffer, encoding: any, cb?: any) => {
				const callback = typeof encoding === 'function' ? encoding : cb
				if (callback) callback(testError)
			})

			const result = await connection.sendCommand('QUERY test.parameter')

			expect(result).toBe(testError)
		})
	})

	describe('error handling', () => {
		beforeEach(() => {
			connection = new Connection('localhost', 3005, true)
		})

		test('should handle connection refused error silently', () => {
			const errorSpy = vi.fn()
			connection.on('error', errorSpy)

			const connectionError = new Error('connect ECONNREFUSED 127.0.0.1:3005')
			mockSocket.emit('error', connectionError)

			expect(connection.connected).toBe(false)
			expect(errorSpy).not.toHaveBeenCalled()
		})

		test('should emit other socket errors', () => {
			const errorSpy = vi.fn()
			connection.on('error', errorSpy)

			const socketError = new Error('Some other socket error')
			mockSocket.emit('error', socketError)

			expect(errorSpy).toHaveBeenCalledWith(socketError)
		})
	})

	describe('keepalive functionality', () => {
		beforeEach(async () => {
			connection = new Connection('localhost', 3005, true)
			// Wait for connection to be established
			await vi.waitFor(() => {
				expect(connection.connected).toBe(true)
			})
		})

		test('should start keepalive timer on connection', () => {
			mockSocket.onWrite = vi.fn()
			// Connection is already established in beforeEach
			expect(connection.connected).toBe(true)

			// Advance time to trigger keepalive
			vi.advanceTimersByTime(5000)

			expect(mockSocket.onWrite).toHaveBeenCalledWith('\r\n', 'utf-8')
		})

		test('should not send keepalive if recent message was sent', async () => {
			const writeSpy = vi.fn()
			mockSocket.onWrite = writeSpy

			// Send a command to update the last message sent time
			await connection.sendCommand('QUERY test.parameter')

			// Clear the write spy to only track keepalive messages
			writeSpy.mockClear()

			vi.advanceTimersByTime(3000)

			// Should not send keepalive because a message was sent recently
			expect(writeSpy).not.toHaveBeenCalledWith('\r\n', 'utf-8')
		})

		test('should send keepalive if no recent message was sent', async () => {
			const writeSpy = vi.fn()
			mockSocket.onWrite = writeSpy

			// Send a command first
			await connection.sendCommand('QUERY test.parameter')

			// Clear the write spy
			writeSpy.mockClear()

			vi.advanceTimersByTime(5000)

			// Should send keepalive because enough time has passed since last message
			expect(writeSpy).toHaveBeenCalledWith('\r\n', 'utf-8')
		})

		test('should reset last message time on connection', async () => {
			// Disconnect and reconnect to test the reset behavior
			mockSocket.mockClose()

			// Wait for disconnect
			await vi.waitFor(() => {
				expect(connection.connected).toBe(false)
			})

			// Set up for reconnection
			let reconnectedSocket: Socket
			Socket.mockOnNextSocket((socket) => {
				reconnectedSocket = socket
			})

			// Trigger reconnect
			vi.advanceTimersByTime(5000)

			// Wait for reconnection
			await vi.waitFor(() => {
				expect(connection.connected).toBe(true)
			})

			reconnectedSocket!.onWrite = vi.fn()

			// Should send keepalive immediately on first interval since lastMessageTime was reset
			vi.advanceTimersByTime(5000)

			expect(reconnectedSocket!.onWrite).toHaveBeenCalledWith('\r\n', 'utf-8')
		})

		test('should stop keepalive timer on disconnection', () => {
			// Connection is already established in beforeEach

			// Clear write calls from connection
			mockSocket.onWrite = vi.fn()

			// Disconnect
			mockSocket.mockClose()

			// Advance time - should not trigger keepalive
			vi.advanceTimersByTime(5000)

			expect(mockSocket.onWrite).not.toHaveBeenCalledWith('\r\n', 'utf-8')
		})

		test('should clear keepalive timer on manual disconnect', () => {
			// Connection is already established in beforeEach

			connection.disconnect()

			// Clear write calls
			mockSocket.onWrite = vi.fn()

			// Advance time - should not trigger keepalive
			vi.advanceTimersByTime(5000)

			expect(mockSocket.onWrite).not.toHaveBeenCalledWith('\r\n', 'utf-8')
		})

		test('should update last message sent time when sending commands', async () => {
			const writeSpy = vi.fn()
			mockSocket.onWrite = writeSpy

			// Send multiple commands with small intervals
			await connection.sendCommand('QUERY test1')
			vi.advanceTimersByTime(1000)
			await connection.sendCommand('QUERY test2')
			vi.advanceTimersByTime(1000)
			await connection.sendCommand('QUERY test3')

			// Clear the write spy to only track keepalive
			writeSpy.mockClear()

			vi.advanceTimersByTime(4000) // since last command, which is > 2.5s

			// Should send keepalive because enough time has passed since last command
			expect(writeSpy).toHaveBeenCalledWith('\r\n', 'utf-8')
		})
	})

	describe('socket cleanup', () => {
		beforeEach(() => {
			connection = new Connection('localhost', 3005, false)
		})

		test('should cleanup old socket when setting up new one', () => {
			// Setup first socket using public API
			connection.changeConnection('localhost', 3005)
			const firstSocket = mockSocket
			const removeListenersSpy = vi.spyOn(firstSocket, 'removeAllListeners')
			const destroySpy = vi.spyOn(firstSocket, 'destroy')

			// Setup for second socket
			let secondSocket: Socket
			Socket.mockOnNextSocket((socket) => {
				secondSocket = socket
			})

			// Setup second socket using public API
			connection.changeConnection('newhost', 4000)

			expect(removeListenersSpy).toHaveBeenCalled()
			expect(destroySpy).toHaveBeenCalled()
			expect(secondSocket!).toBeDefined()
		})

		test('should not destroy already destroyed socket', () => {
			// Setup first socket using public API
			connection.changeConnection('localhost', 3005)
			const firstSocket = mockSocket
			firstSocket.destroyed = true

			const removeListenersSpy = vi.spyOn(firstSocket, 'removeAllListeners')
			const destroySpy = vi.spyOn(firstSocket, 'destroy')

			// Setup for second socket
			let secondSocket: Socket
			Socket.mockOnNextSocket((socket) => {
				secondSocket = socket
			})
			// Setup second socket using public API
			connection.changeConnection('newhost', 4000)

			expect(removeListenersSpy).toHaveBeenCalled()
			expect(destroySpy).not.toHaveBeenCalled()
			expect(secondSocket!).toBeDefined()
		})
	})
})
