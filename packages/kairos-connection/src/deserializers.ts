import {
	Commands,
	KairosCommand,
	ListCommand,
	QueryValueCommand,
	SetValueCommand,
	SubscribeValueCommand,
	UnsubscribeValueCommand,
} from './commands.js'
import { ResponseTypes } from './connection.js'
import type { Response } from './kairos-minimal.js'

export interface DeserializeResult {
	remainingLines: string[]
	response: Response<any>
}

export type Deserializer<C extends KairosCommand> = (
	lineBuffer: readonly string[],
	command: C
) => DeserializeResult | null

const setValueDeserializer: Deserializer<SetValueCommand> = (lineBuffer, command) => {
	const firstLine = lineBuffer[0]

	if (firstLine === 'OK') {
		return {
			remainingLines: lineBuffer.slice(1),
			response: {
				command: command.command,
				data: undefined,
				type: ResponseTypes.OK,
				message: firstLine,
			},
		}
	} else {
		throw new Error(`Error response received: ${firstLine}`)
	}
}
const queryValueDeserializer: Deserializer<QueryValueCommand> = (lineBuffer, command) => {
	const firstLine = lineBuffer[0]

	if (firstLine.startsWith(`${command.params.path}=`)) {
		const value = firstLine.slice(command.params.path.length + 1)
		return {
			remainingLines: lineBuffer.slice(1),
			response: {
				command: command.command,
				data: value,
				type: ResponseTypes.OK,
				message: firstLine,
			},
		}
	} else {
		throw new Error(`Error response received: ${firstLine}`)
	}
}
const listDeserializer: Deserializer<ListCommand> = (lineBuffer, command) => {
	const firstLine = lineBuffer[0]

	if (firstLine === `list_ex:${command.params.path}=`) {
		const emptyLineIndex = lineBuffer.indexOf('')
		if (emptyLineIndex !== -1) {
			const listItems = lineBuffer.slice(0, emptyLineIndex)
			const messageString = listItems.join('\n')
			listItems.shift()

			return {
				remainingLines: lineBuffer.slice(emptyLineIndex + 1),
				response: {
					command: command.command,
					data: listItems,
					type: ResponseTypes.OK,
					message: messageString,
				},
			}
		} else {
			// Data not yet ready, stop processing
			return null
		}
	} else {
		throw new Error(`Error response received: ${firstLine}`)
	}
}
const subscribeValueDeserializer: Deserializer<SubscribeValueCommand> = () => {
	throw new Error('Not implemented yet')
}
const unsubscribeValueDeserializer: Deserializer<UnsubscribeValueCommand> = () => {
	throw new Error('Not implemented yet')
}

type Deserializers<C extends KairosCommand> = {
	[command in C as command['command']]: Deserializer<command>
}

export const deserializers: Readonly<Deserializers<KairosCommand>> = {
	[Commands.SetValue]: setValueDeserializer,
	[Commands.QueryValue]: queryValueDeserializer,
	[Commands.SubscribeValue]: subscribeValueDeserializer,
	[Commands.UnsubscribeValue]: unsubscribeValueDeserializer,
	[Commands.List]: listDeserializer,
}
