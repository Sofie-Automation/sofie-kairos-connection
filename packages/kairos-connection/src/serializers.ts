/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { KairosCommand, Commands } from './commands.js'
import { CustomCommandParameters } from './parameters.js'

const customCommandSerializer = (_: Commands, { command }: CustomCommandParameters) => command

type Serializers<C extends KairosCommand> = {
	[command in C as command['command']]: Array<(c: command['command'], p: command['params']) => string>
}

export const serializers: Readonly<Serializers<KairosCommand>> = {
	[Commands.Custom]: [customCommandSerializer],
}
