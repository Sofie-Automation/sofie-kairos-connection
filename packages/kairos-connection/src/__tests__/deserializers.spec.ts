/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, it } from 'vitest'
import { deserializers } from '../deserializers.js'
import { ResponseTypes } from '../connection.js'
import {
	Commands,
	QueryValueCommand,
	SetValueCommand,
	SubscribeValueCommand,
	UnsubscribeValueCommand,
	ListCommand,
} from '../commands.js'

describe('deserializers', () => {
	it('should have deserializers for every command', () => {
		for (const c of Object.values<Commands>(Commands)) {
			expect(deserializers[c]).toBeDefined()
		}
	})

	it('should have command for every deserializer', () => {
		for (const c of Object.keys(deserializers)) {
			expect(Object.values<Commands>(Commands).includes(c as Commands)).toBeTruthy()
		}
	})

	describe('QueryValue deserializer', () => {
		it('should deserialize a successful QueryValue response', () => {
			const command: QueryValueCommand = {
				command: Commands.QueryValue,
				params: {
					path: 'SCENES.Main.Layers.Background.source_pgm',
				},
			}

			const lineBuffer = ['SCENES.Main.Layers.Background.source_pgm=IP1', 'next line']
			const result = deserializers[Commands.QueryValue](lineBuffer, command)

			expect(result).toBeDefined()
			expect(result!.remainingLines).toEqual(['next line'])
			expect(result!.response).toEqual({
				command: Commands.QueryValue,
				data: 'IP1',
				type: ResponseTypes.OK,
				message: 'SCENES.Main.Layers.Background.source_pgm=IP1',
			})
		})

		it('should handle empty value in QueryValue response', () => {
			const command: QueryValueCommand = {
				command: Commands.QueryValue,
				params: {
					path: 'SCENES.Main.Layers.Background.source_pgm',
				},
			}

			const lineBuffer = ['SCENES.Main.Layers.Background.source_pgm=', 'next line']
			const result = deserializers[Commands.QueryValue](lineBuffer, command)

			expect(result).toBeDefined()
			expect(result!.response.data).toBe('')
		})

		it('should throw error for invalid QueryValue response', () => {
			const command: QueryValueCommand = {
				command: Commands.QueryValue,
				params: {
					path: 'SCENES.Main.Layers.Background.source_pgm',
				},
			}

			const lineBuffer = ['Error: Invalid path', 'next line']

			expect(() => {
				deserializers[Commands.QueryValue](lineBuffer, command)
			}).toThrow('Error response received: Error: Invalid path')
		})
	})

	describe('SetValue deserializer', () => {
		it('should deserialize a successful SetValue response', () => {
			const command: SetValueCommand = {
				command: Commands.SetValue,
				params: {
					path: 'SCENES.Main.Layers.Background.source_pgm',
					value: 'IP1',
				},
			}

			const lineBuffer = ['OK', 'next line']
			const result = deserializers[Commands.SetValue](lineBuffer, command)

			expect(result).toBeDefined()
			expect(result!.remainingLines).toEqual(['next line'])
			expect(result!.response).toEqual({
				command: Commands.SetValue,
				data: undefined,
				type: ResponseTypes.OK,
				message: 'OK',
			})
		})

		it('should throw error for invalid SetValue response', () => {
			const command: SetValueCommand = {
				command: Commands.SetValue,
				params: {
					path: 'SCENES.Main.Layers.Background.source_pgm',
					value: 'IP1',
				},
			}

			const lineBuffer = ['Error: Invalid value', 'next line']

			expect(() => {
				deserializers[Commands.SetValue](lineBuffer, command)
			}).toThrow('Error response received: Error: Invalid value')
		})
	})

	describe('List deserializer', () => {
		it('should deserialize a successful List response', () => {
			const command: ListCommand = {
				command: Commands.List,
				params: {
					path: 'SCENES.Main.Layers',
				},
			}

			const lineBuffer = [
				'list_ex:SCENES.Main.Layers=',
				'Background',
				'Foreground',
				'PGM',
				'',
				'next line',
				//
			]
			const result = deserializers[Commands.List](lineBuffer, command)

			expect(result).toBeDefined()
			expect(result!.remainingLines).toEqual(['next line'])
			expect(result!.response).toEqual({
				command: Commands.List,
				data: ['Background', 'Foreground', 'PGM'],
				type: ResponseTypes.OK,
				message: 'list_ex:SCENES.Main.Layers=\nBackground\nForeground\nPGM',
			})
		})

		it('should deserialize an empty List response', () => {
			const command: ListCommand = {
				command: Commands.List,
				params: {
					path: 'SCENES.Empty',
				},
			}

			const lineBuffer = ['list_ex:SCENES.Empty=', '', 'next line']
			const result = deserializers[Commands.List](lineBuffer, command)

			expect(result).toBeDefined()
			expect(result!.response.data).toEqual([])
		})

		it('should return null when List response is incomplete (no empty line)', () => {
			const command: ListCommand = {
				command: Commands.List,
				params: {
					path: 'SCENES.Main.Layers',
				},
			}

			const lineBuffer = ['list_ex:SCENES.Main.Layers=', 'Background', 'Foreground']
			const result = deserializers[Commands.List](lineBuffer, command)

			expect(result).toBeNull()
		})

		it('should throw error for invalid List response', () => {
			const command: ListCommand = {
				command: Commands.List,
				params: {
					path: 'SCENES.Main.Layers',
				},
			}

			const lineBuffer = ['Error: Invalid path', 'next line']

			expect(() => {
				deserializers[Commands.List](lineBuffer, command)
			}).toThrow('Error response received: Error: Invalid path')
		})
	})

	describe('SubscribeValue deserializer', () => {
		it('should throw "Not implemented yet" error', () => {
			const command: SubscribeValueCommand = {
				command: Commands.SubscribeValue,
				params: {
					path: 'SCENES.Main.Layers.Background.source_pgm',
				},
			}

			const lineBuffer = ['subscribe:SCENES.Main.Layers.Background.source_pgm']

			expect(() => {
				deserializers[Commands.SubscribeValue](lineBuffer, command)
			}).toThrow('Not implemented yet')
		})
	})

	describe('UnsubscribeValue deserializer', () => {
		it('should throw "Not implemented yet" error', () => {
			const command: UnsubscribeValueCommand = {
				command: Commands.UnsubscribeValue,
				params: {
					path: 'SCENES.Main.Layers.Background.source_pgm',
				},
			}

			const lineBuffer = ['unsubscribe:SCENES.Main.Layers.Background.source_pgm']

			expect(() => {
				deserializers[Commands.UnsubscribeValue](lineBuffer, command)
			}).toThrow('Not implemented yet')
		})
	})
})
