/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AMCPCommand, Commands } from './commands.js'
import { CustomCommandParameters } from './parameters.js'

const customCommandSerializer = (_: Commands, { command }: CustomCommandParameters) => command

const customParamsSerializer = (
	_: Commands,
	params: { customParams?: Record<string, string | number | boolean | null> }
): string => {
	if (!params.customParams) {
		return ''
	}

	return Object.entries<string | number | boolean | null>(params.customParams)
		.map(([key, value]) => {
			// For null, undefined, or empty string values, just return the key name
			if (value === null || value === undefined || value === '') {
				return key
			}
			// Quote string values, leave others as is
			const paramValue = typeof value === 'string' ? `"${value}"` : value
			return `${key} ${paramValue}`
		})
		.join(' ')
}

type Serializers<C extends AMCPCommand> = {
	[command in C as command['command']]: Array<(c: command['command'], p: command['params']) => string>
}

export const serializers: Readonly<Serializers<AMCPCommand>> = {
	[Commands.Custom]: [customCommandSerializer, customParamsSerializer],
}
