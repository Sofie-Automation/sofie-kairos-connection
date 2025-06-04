import { describe, expect, it } from 'vitest'
import { serializers } from '../serializers.js'
import { Commands, CustomCommand } from '../commands.js'

describe('serializers', () => {
	it('should have serializers for every command', () => {
		for (const c of Object.values<Commands>(Commands)) {
			expect(serializers[c]).toBeDefined()
		}
	})

	it('should have command for every serializers', () => {
		for (const c of Object.keys(serializers)) {
			expect(Object.values<Commands>(Commands).includes(c as Commands)).toBeTruthy()
		}
	})

	it('should serialize a custom', () => {
		const command: CustomCommand = {
			command: Commands.Custom,
			params: {
				command: 'INFO 1',
			},
		}

		const serialized = serializers[Commands.Custom].map((fn) => fn(command.command, command.params))

		expect(serialized).toHaveLength(serializers[Commands.Custom].length)

		const result = serialized.filter((l) => l !== '').join(' ')

		expect(result).toBe('INFO 1')
	})

	it('should serialize a custom command with custom parameters', () => {
		const command: CustomCommand = {
			command: Commands.Custom,
			params: {
				command: 'MYCOMMAND',
				customParams: {
					channel: 1,
					layer: 10,
					name: 'test',
					enabled: true,
					loop: null,
					optional: null,
				},
			},
		}

		const serialized = serializers[Commands.Custom].map((fn) => fn(command.command, command.params))
		const result = serialized.filter((l) => l !== '').join(' ')

		expect(result).toBe('MYCOMMAND channel 1 layer 10 name "test" enabled true loop optional')
	})
})
