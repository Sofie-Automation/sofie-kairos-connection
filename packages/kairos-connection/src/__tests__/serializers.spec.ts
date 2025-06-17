import { describe, expect, it } from 'vitest'
import { serializers } from '../serializers.js'
import {
	Commands,
	QueryValueCommand,
	SetValueCommand,
	SubscribeValueCommand,
	UnsubscribeValueCommand,
	ListCommand,
} from '../commands.js'

describe('serializers', () => {
	it('should have serializers for every command', () => {
		for (const c of Object.values<Commands>(Commands)) {
			expect(serializers[c]).toBeDefined()
		}
	})

	it('should have command for every serializer', () => {
		for (const c of Object.keys(serializers)) {
			expect(Object.values<Commands>(Commands).includes(c as Commands)).toBeTruthy()
		}
	})

	it('should serialize a QueryValue command', () => {
		const command: QueryValueCommand = {
			command: Commands.QueryValue,
			params: {
				path: 'SCENES.Main.Layers.Background.source_pgm',
			},
		}

		const serialized = serializers[Commands.QueryValue](command.command, command.params)

		expect(serialized).toBe('SCENES.Main.Layers.Background.source_pgm')
	})

	it('should serialize a SetValue command', () => {
		const command: SetValueCommand = {
			command: Commands.SetValue,
			params: {
				path: 'SCENES.Main.Layers.Background.source_pgm',
				value: 'IP1',
			},
		}

		const serialized = serializers[Commands.SetValue](command.command, command.params)

		expect(serialized).toBe('SCENES.Main.Layers.Background.source_pgm=IP1')
	})

	it('should serialize a SubscribeValue command', () => {
		const command: SubscribeValueCommand = {
			command: Commands.SubscribeValue,
			params: {
				path: 'SCENES.Main.Layers.Background.source_pgm',
			},
		}

		const serialized = serializers[Commands.SubscribeValue](command.command, command.params)

		expect(serialized).toBe('subscribe:SCENES.Main.Layers.Background.source_pgm')
	})

	it('should serialize an UnsubscribeValue command', () => {
		const command: UnsubscribeValueCommand = {
			command: Commands.UnsubscribeValue,
			params: {
				path: 'SCENES.Main.Layers.Background.source_pgm',
			},
		}

		const serialized = serializers[Commands.UnsubscribeValue](command.command, command.params)

		expect(serialized).toBe('unsubscribe:SCENES.Main.Layers.Background.source_pgm')
	})

	it('should serialize a List command', () => {
		const command: ListCommand = {
			command: Commands.List,
			params: {
				path: 'SCENES.Main.Layers',
			},
		}

		const serialized = serializers[Commands.List](command.command, command.params)

		expect(serialized).toBe('list_ex:SCENES.Main.Layers')
	})
})
