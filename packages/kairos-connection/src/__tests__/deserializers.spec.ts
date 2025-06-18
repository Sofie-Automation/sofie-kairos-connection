/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, it } from 'vitest'
import {
	queryAttributeDeserializer,
	okOrErrorDeserializer,
	listDeserializer,
	subscribeValueDeserializer,
	unsubscribeValueDeserializer,
} from '../deserializers.js'

describe('deserializers', () => {
	describe('QueryValue deserializer', () => {
		it('should deserialize a successful QueryValue response', () => {
			const lineBuffer = ['SCENES.Main.Layers.Background.source_pgm=IP1', 'next line']
			const result = queryAttributeDeserializer(lineBuffer, 'SCENES.Main.Layers.Background.source_pgm')

			expect(result).toBeDefined()
			expect(result!.remainingLines).toEqual(['next line'])
			expect(result!.response).toEqual('IP1')
		})

		it('should handle empty value in QueryValue response', () => {
			const lineBuffer = ['SCENES.Main.Layers.Background.source_pgm=', 'next line']
			const result = queryAttributeDeserializer(lineBuffer, 'SCENES.Main.Layers.Background.source_pgm')

			expect(result).toBeDefined()
			expect(result!.remainingLines).toEqual(['next line'])
			expect(result!.response).toBe('')
		})

		it('should throw error for invalid QueryValue response', () => {
			const lineBuffer = ['Error: Invalid path', 'next line']

			expect(() => {
				queryAttributeDeserializer(lineBuffer, 'SCENES.Main.Layers.Background.source_pgm')
			}).toThrow('Error response received: Error: Invalid path')
		})
	})

	describe('OkOrError deserializer', () => {
		it('should deserialize a successful SetValue response', () => {
			const lineBuffer = ['OK', 'next line']
			const result = okOrErrorDeserializer(lineBuffer)

			expect(result).toBeDefined()
			expect(result!.remainingLines).toEqual(['next line'])
			expect(result!.response).toBeUndefined()
		})

		it('should throw error for invalid SetValue response', () => {
			const lineBuffer = ['Error: Invalid value', 'next line']

			expect(() => {
				okOrErrorDeserializer(lineBuffer)
			}).toThrow('Error response received: Error: Invalid value')
		})
	})

	describe('List deserializer', () => {
		it('should deserialize a successful List response', () => {
			const lineBuffer = ['list_ex:SCENES.Main.Layers=', 'Background', 'Foreground', 'PGM', '', 'next line']
			const result = listDeserializer(lineBuffer, 'SCENES.Main.Layers')

			expect(result).toBeDefined()
			expect(result!.remainingLines).toEqual(['next line'])
			expect(result!.response).toEqual(['Background', 'Foreground', 'PGM'])
		})

		it('should deserialize an empty List response', () => {
			const lineBuffer = ['list_ex:SCENES.Empty=', '', 'next line']
			const result = listDeserializer(lineBuffer, 'SCENES.Empty')

			expect(result).toBeDefined()
			expect(result!.remainingLines).toEqual(['next line'])
			expect(result!.response).toEqual([])
		})

		it('should return null when List response is incomplete (no empty line)', () => {
			const lineBuffer = ['list_ex:SCENES.Main.Layers=', 'Background', 'Foreground']
			const result = listDeserializer(lineBuffer, 'SCENES.Main.Layers')

			expect(result).toBeNull()
		})

		it('should throw error for invalid List response', () => {
			const lineBuffer = ['Error: Invalid path', 'next line']

			expect(() => {
				listDeserializer(lineBuffer, 'SCENES.Main.Layers')
			}).toThrow('Error response received: Error: Invalid path')
		})
	})

	describe('SubscribeValue deserializer', () => {
		it('should throw "Not implemented yet" error', () => {
			const lineBuffer = ['subscribe:SCENES.Main.Layers.Background.source_pgm']

			expect(() => {
				subscribeValueDeserializer(lineBuffer)
			}).toThrow('Not implemented yet')
		})
	})

	describe('UnsubscribeValue deserializer', () => {
		it('should throw "Not implemented yet" error', () => {
			const lineBuffer = ['unsubscribe:SCENES.Main.Layers.Background.source_pgm']

			expect(() => {
				unsubscribeValueDeserializer(lineBuffer)
			}).toThrow('Not implemented yet')
		})
	})
})
